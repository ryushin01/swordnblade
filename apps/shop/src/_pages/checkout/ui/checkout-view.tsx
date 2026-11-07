'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  countryName,
  estimateCustoms,
  findCountryRule,
  formatKRW,
  type Locale,
  type Order,
  permitNote,
  requiresPossessionPermit,
} from '@snb/domain';

import { useCartHydrated, useCartStore } from '@/entities/cart';
import { localizeForLocale, useSwords } from '@/entities/sword';
import { CustomsBreakdown, useCustomsConfig } from '@/entities/tariff';
import { Link, useRouter } from '@/shared/i18n';
import { OrnamentHeading } from '@/shared/ui';

import { CheckoutForm } from './checkout-form';

export function CheckoutView() {
  const t = useTranslations('Checkout');
  const common = useTranslations('Common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const hydrated = useCartHydrated();
  const lines = useCartStore((state) => state.lines);
  const destination = useCartStore((state) => state.destination);
  const clear = useCartStore((state) => state.clear);
  const swords = useSwords();
  const config = useCustomsConfig();
  const [placedId, setPlacedId] = useState<string | null>(null);

  if (placedId) {
    return (
      <p aria-live="polite" className="py-24 text-center">
        {t('placed', { id: placedId })}
      </p>
    );
  }

  if (!hydrated || swords.isPending || config.isPending) {
    return (
      <p aria-busy="true" className="py-24 text-center">
        {t('preparing')}
      </p>
    );
  }
  if (swords.isError || config.isError) {
    return (
      <p role="alert" className="py-24 text-center">
        {t('loadError')}
      </p>
    );
  }

  const items = lines.flatMap((line) => {
    const sword = swords.data.find((item) => item.id === line.swordId);
    return sword ? [{ line, sword: localizeForLocale(sword, locale) }] : [];
  });

  if (items.length === 0) {
    return (
      <div className="grid justify-items-center gap-4 py-24 text-center">
        <p className="text-lg">{t('empty')}</p>
        <Link href="/" className="underline underline-offset-4">
          {common('browse')}
        </Link>
      </div>
    );
  }

  const estimate = estimateCustoms(
    items.map(({ line, sword }) => ({ origin: sword.origin, unitPrice: sword.price, quantity: line.quantity })),
    destination,
    config.data,
  );
  const rule = findCountryRule(config.data, destination);
  const needsPermit = items.some(({ sword }) => requiresPossessionPermit(sword.specs));

  const handlePlaced = (order: Order) => {
    setPlacedId(order.id);
    clear();
    router.replace(`/orders/${order.id}`);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <section aria-labelledby="checkout-form-title" className="grid content-start gap-6">
        <h2 id="checkout-form-title" className="sr-only">
          {t('formTitle')}
        </h2>
        <p>
          {t('destination')} <strong className="font-semibold">{countryName(destination, locale)}</strong>{' '}
          <Link href="/cart" className="text-sm underline underline-offset-4">
            {t('changeInCart')}
          </Link>
        </p>
        <CheckoutForm
          destination={destination}
          lines={items.map(({ line }) => ({ swordId: line.swordId, quantity: line.quantity }))}
          needsPermit={needsPermit}
          permitNote={permitNote(rule, locale)}
          onPlaced={handlePlaced}
        />
      </section>
      <aside aria-labelledby="checkout-summary-title" className="grid content-start gap-5">
        <OrnamentHeading id="checkout-summary-title">{t('summaryTitle')}</OrnamentHeading>
        <ul className="grid gap-2">
          {items.map(({ line, sword }) => (
            <li key={sword.id} className="flex justify-between gap-4">
              <span>
                {sword.name} × {line.quantity}
              </span>
              <span className="tabular-nums">{formatKRW(sword.price * line.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <CustomsBreakdown estimate={estimate} config={config.data} />
      </aside>
    </div>
  );
}

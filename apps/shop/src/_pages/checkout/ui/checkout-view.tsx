'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { countryName, type Locale, type Order, permitNote } from '@snb/domain';

import { useCartStore } from '@/entities/cart';
import { CustomsBreakdown } from '@/entities/tariff';
import { useCartQuote } from '@/features/cart-quote';
import { Link, useRouter } from '@/shared/i18n';
import { OrnamentHeading, PriceTag } from '@/shared/ui';

import { CheckoutForm } from './checkout-form';

export function CheckoutView() {
  const t = useTranslations('Checkout');
  const common = useTranslations('Common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const clear = useCartStore((state) => state.clear);
  const quote = useCartQuote();
  const [placedId, setPlacedId] = useState<string | null>(null);

  if (placedId) {
    return (
      <p aria-live="polite" className="py-24 text-center">
        {t('placed', { id: placedId })}
      </p>
    );
  }

  if (quote.status === 'loading') {
    return (
      <p aria-busy="true" className="py-24 text-center">
        {t('preparing')}
      </p>
    );
  }
  if (quote.status === 'error') {
    return (
      <p role="alert" className="py-24 text-center">
        {t('loadError')}
      </p>
    );
  }

  const { destination, items, estimate, needsPermit, rule, config } = quote;

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
          {items.map(({ line, sword, pricing }) => (
            <li key={sword.id} className="flex justify-between gap-4">
              <span>
                {sword.name} × {line.quantity}
              </span>
              <PriceTag
                price={pricing.price * line.quantity}
                listPrice={pricing.listPrice * line.quantity}
                className="justify-end"
              />
            </li>
          ))}
        </ul>
        <CustomsBreakdown estimate={estimate} config={config} />
      </aside>
    </div>
  );
}

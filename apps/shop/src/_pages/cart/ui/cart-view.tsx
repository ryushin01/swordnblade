'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  countryName,
  estimateCustoms,
  findCountryRule,
  formatKRW,
  type Locale,
  permitNote,
  requiresPossessionPermit,
} from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';

import { useCartHydrated, useCartStore } from '@/entities/cart';
import { localizeForLocale, useSwords } from '@/entities/sword';
import { CustomsBreakdown, useCustomsConfig } from '@/entities/tariff';
import { DestinationSelect } from '@/features/choose-destination';
import { Link } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { buttonVariants, LiveTotal, OrnamentHeading } from '@/shared/ui';

import { QuantitySelect, RemoveLineButton } from './cart-line-controls';

export function CartView() {
  const t = useTranslations('Cart');
  const common = useTranslations('Common');
  const customs = useTranslations('Customs');
  const locale = useLocale() as Locale;
  const hydrated = useCartHydrated();
  const lines = useCartStore((state) => state.lines);
  const destination = useCartStore((state) => state.destination);
  const swords = useSwords();
  const config = useCustomsConfig();

  if (!hydrated || swords.isPending || config.isPending) {
    return (
      <p aria-busy="true" className="py-24 text-center">
        {t('loading')}
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
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 rounded-sm bg-transparent px-6')}>
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
  const needsPermit = items.some(({ sword }) => requiresPossessionPermit(sword.specs));
  const rule = findCountryRule(config.data, destination);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <section aria-labelledby="cart-lines-title" className="grid content-start gap-4">
        <h2 id="cart-lines-title" className="sr-only">
          {t('linesTitle')}
        </h2>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{t('caption')}</caption>
          <thead className="text-sm small-caps text-ink-muted">
            <tr className="border-b border-line">
              <th scope="col" className="py-2 font-normal">
                {t('colSword')}
              </th>
              <th scope="col" className="hidden py-2 font-normal sm:table-cell">
                {t('colOrigin')}
              </th>
              <th scope="col" className="py-2 font-normal">
                {t('colQuantity')}
              </th>
              <th scope="col" className="py-2 text-right font-normal">
                {t('colAmount')}
              </th>
              <th scope="col" className="py-2 font-normal">
                <span className="sr-only">{t('colRemove')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ line, sword }) => (
              <tr key={sword.id} className="border-b border-line align-middle">
                <th scope="row" className="py-3 pr-2 font-normal">
                  <span className="flex items-center gap-3">
                    <SwordRelief art={sword.art} className="hidden size-16 shrink-0 sm:block" pigment={0.7} />
                    <span className="grid">
                      <Link href={`/swords/${sword.slug}`} className="text-lg underline-offset-4 hover:underline">
                        {sword.name}
                      </Link>
                      <span className="text-sm text-ink-muted">{formatKRW(sword.price, locale)}</span>
                      <span className="text-sm text-ink-muted sm:hidden">
                        {t('shippedFrom', { country: countryName(sword.origin, locale) })}
                      </span>
                    </span>
                  </span>
                </th>
                <td className="hidden py-3 sm:table-cell">{countryName(sword.origin, locale)}</td>
                <td className="py-3">
                  <QuantitySelect swordId={sword.id} name={sword.name} quantity={line.quantity} stock={sword.stock} />
                </td>
                <td className="py-3 text-right tabular-nums">{formatKRW(sword.price * line.quantity, locale)}</td>
                <td className="py-3 text-right">
                  <RemoveLineButton swordId={sword.id} name={sword.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {needsPermit ? (
          <p className="text-sm text-ink-muted">
            <strong className="font-semibold text-accent">{t('permitLabel')}</strong> · {permitNote(rule, locale)}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="cart-summary-title" className="grid content-start gap-5">
        <OrnamentHeading id="cart-summary-title">{t('summaryTitle')}</OrnamentHeading>
        <DestinationSelect config={config.data} />
        <LiveTotal label={customs('total')} total={estimate.totals.total} />
        <CustomsBreakdown estimate={estimate} config={config.data} />
        <Link href="/checkout" className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-sm text-base small-caps')}>
          {t('checkout')}
        </Link>
      </section>
    </div>
  );
}

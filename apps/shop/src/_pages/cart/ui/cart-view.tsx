'use client';

import { useLocale, useTranslations } from 'next-intl';

import { countryName, formatKRW, type Locale, permitNote } from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';

import { CustomsBreakdown } from '@/entities/tariff';
import { useCartQuote } from '@/features/cart-quote';
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
  const quote = useCartQuote();

  if (quote.status === 'loading') {
    return (
      <p aria-busy="true" className="py-24 text-center">
        {t('loading')}
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

  const { items, estimate, needsPermit, rule, config } = quote;

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
        <DestinationSelect config={config} />
        <LiveTotal label={customs('total')} total={estimate.totals.total} />
        <CustomsBreakdown estimate={estimate} config={config} />
        <Link href="/checkout" className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-sm text-base small-caps')}>
          {t('checkout')}
        </Link>
      </section>
    </div>
  );
}

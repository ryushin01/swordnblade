'use client';

import { useLocale, useTranslations } from 'next-intl';

import { countryName, formatKRW, type Locale, orderStatusLabel } from '@snb/domain';

import { useOrder } from '@/entities/order';
import { swordNameFor } from '@/entities/sword';
import { Link } from '@/shared/i18n';
import { OrnamentHeading } from '@/shared/ui';

export function OrderReceipt({ id }: { id: string }) {
  const t = useTranslations('Order');
  const common = useTranslations('Common');
  const locale = useLocale() as Locale;
  const won = (value: number) => formatKRW(value, locale);
  const { data: order, isPending, isError } = useOrder(id);

  if (isPending) {
    return (
      <p aria-busy="true" className="py-24 text-center">
        {t('loading')}
      </p>
    );
  }
  if (isError) {
    return (
      <div className="grid justify-items-center gap-4 py-24 text-center">
        <h1 className="text-2xl text-carved">{t('notFound')}</h1>
        <Link href="/" className="underline underline-offset-4">
          {common('backToWall')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <header className="grid justify-items-center gap-3 text-center">
        <OrnamentHeading as="p" className="w-full">
          {t('eyebrow')}
        </OrnamentHeading>
        <h1 className="text-3xl text-carved">{t('title')}</h1>
        <p className="text-ink-muted">
          {t('number')} <strong className="font-semibold tabular-nums text-ink">{order.id}</strong> ·{' '}
          {orderStatusLabel(order.status, locale)}
        </p>
        {order.status === 'permit-review' ? <p className="text-sm text-ink-muted">{t('permitReview')}</p> : null}
      </header>

      <section aria-labelledby="receipt-lines" className="grid gap-3">
        <OrnamentHeading id="receipt-lines">{t('linesTitle')}</OrnamentHeading>
        <ul className="grid gap-2">
          {order.lines.map((line) => (
            <li key={line.swordId} className="flex justify-between gap-4">
              <span>
                {swordNameFor(line.swordId, line.name, locale)} × {line.quantity}{' '}
                <span className="text-sm text-ink-muted">
                  {t('shippedFrom', { country: countryName(line.origin, locale) })}
                </span>
              </span>
              <span className="tabular-nums">{won(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-t border-line pt-3">
          <dt className="text-ink-muted">{t('shipping')}</dt>
          <dd className="text-right tabular-nums">{won(order.amounts.shipping)}</dd>
          <dt className="text-ink-muted">{t('duty')}</dt>
          <dd className="text-right tabular-nums">{won(order.amounts.duty)}</dd>
          <dt className="text-ink-muted">{t('vat')}</dt>
          <dd className="text-right tabular-nums">{won(order.amounts.vat)}</dd>
          <dt className="text-lg">{t('paid')}</dt>
          <dd className="text-right text-lg tabular-nums">{won(order.amounts.total)}</dd>
        </dl>
      </section>

      <section aria-labelledby="receipt-shipping" className="grid gap-3">
        <OrnamentHeading id="receipt-shipping">{t('addressTitle')}</OrnamentHeading>
        <p>
          {order.customer.name} · {countryName(order.destination, locale)}
          <br />({order.customer.postalCode}) {order.customer.address}
        </p>
      </section>

      <Link href="/" className="justify-self-center underline underline-offset-4">
        {common('backToWall')}
      </Link>
    </div>
  );
}

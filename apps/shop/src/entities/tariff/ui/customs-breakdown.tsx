import { useLocale, useTranslations } from 'next-intl';

import {
  countryName,
  type CustomsConfig,
  type CustomsEstimate,
  findCountryRule,
  formatCurrency,
  formatKRW,
  formatPercent,
  type Locale,
  toCurrency,
} from '@snb/domain';

import { cn } from '@/shared/lib';

import type { CountryCode } from '@snb/domain';

interface CustomsBreakdownProps {
  estimate: CustomsEstimate;
  config: CustomsConfig;
  /** 총액 아래에 배송 국가 통화로 환산한 값을 함께 보여 줍니다. */
  showLocalCurrency?: boolean;
  className?: string;
}

function Row({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div
      className={cn('flex items-baseline justify-between gap-4 py-1', strong && 'border-t border-line pt-2 text-lg')}
    >
      <dt className={strong ? 'text-ink' : 'text-ink-muted'}>{term}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

/** 출고지별 관세·부가세 예상액과 합계 */
export function CustomsBreakdown({ estimate, config, showLocalCurrency = true, className }: CustomsBreakdownProps) {
  const t = useTranslations('Customs');
  const locale = useLocale() as Locale;
  const rule = findCountryRule(config, estimate.destination);
  const { totals } = estimate;
  const won = (value: number) => formatKRW(value, locale);

  return (
    <div className={cn('grid gap-4', className)}>
      <ul className="grid gap-3">
        {estimate.shipments.map((shipment) => {
          let status: string;
          if (shipment.domestic) status = t('domestic');
          else if (shipment.dutyExempt && shipment.vatExempt) status = t('exempt');
          else if (shipment.dutyExempt) status = t('dutyExempt');
          else
            status = t('taxed', {
              duty: formatPercent(rule.dutyRate, locale),
              vat: formatPercent(rule.vatRate, locale),
            });

          return (
            <li key={shipment.origin} className="rounded-sm border border-line bg-wall-raised/60 p-3">
              <p className="flex flex-wrap items-baseline justify-between gap-2">
                <span>
                  {t('route', {
                    from: countryName(shipment.origin, locale),
                    to: countryName(estimate.destination, locale),
                  })}
                </span>
                <span className="text-sm text-ink-muted">{status}</span>
              </p>
              <dl className="mt-2 text-sm">
                <Row term={t('goods')} value={won(shipment.goods)} />
                <Row
                  term={shipment.domestic ? t('domesticShipping') : t('internationalShipping')}
                  value={won(shipment.shipping)}
                />
                {!shipment.domestic ? (
                  <>
                    <Row
                      term={t('dutiable', { basis: rule.valuation === 'CIF' ? t('basisCIF') : t('basisFOB') })}
                      value={won(shipment.dutiableValue)}
                    />
                    <Row term={t('duty')} value={won(shipment.duty)} />
                    <Row term={estimate.destination === 'KR' ? t('vat') : t('vatOther')} value={won(shipment.vat)} />
                  </>
                ) : null}
              </dl>
            </li>
          );
        })}
      </ul>

      <dl>
        <Row term={t('totalGoods')} value={won(totals.goods)} />
        <Row term={t('totalShipping')} value={won(totals.shipping)} />
        <Row term={t('totalDuty')} value={won(totals.duty)} />
        <Row term={t('totalVat')} value={won(totals.vat)} />
        <Row term={t('total')} value={won(totals.total)} strong />
      </dl>
      {showLocalCurrency && rule.currency !== 'KRW' ? (
        <p className="text-right text-sm text-ink-muted">
          {t('approx', {
            amount: formatCurrency(toCurrency(totals.total, rule.currency, config), rule.currency, locale),
            currency: rule.currency,
            rate: won(config.exchangeRates[rule.currency]),
          })}
        </p>
      ) : null}
      <p className="text-sm text-ink-muted">
        {t('limit', { limit: formatCurrency(rule.dutyFreeLimit, rule.limitCurrency, locale) })}
        {rule.originLimits
          ? Object.entries(rule.originLimits)
              .map(([origin, limit]) =>
                t('originLimit', {
                  country: countryName(origin as CountryCode, locale),
                  limit: formatCurrency(limit, rule.limitCurrency, locale),
                }),
              )
              .join('')
          : null}
        {t('estimateNote')}
      </p>
    </div>
  );
}

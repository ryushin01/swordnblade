import {
  COUNTRY_NAME,
  type CustomsConfig,
  type CustomsEstimate,
  findCountryRule,
  formatCurrency,
  formatKRW,
  formatPercent,
  toCurrency,
} from '@snb/domain';

import { cn } from '@/shared/lib';

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
  const rule = findCountryRule(config, estimate.destination);
  const { totals } = estimate;

  return (
    <div className={cn('grid gap-4', className)}>
      <ul className="grid gap-3">
        {estimate.shipments.map((shipment) => {
          const route = `${COUNTRY_NAME[shipment.origin]} → ${COUNTRY_NAME[estimate.destination]}`;
          let status: string;
          if (shipment.domestic) status = '국내 배송 · 관세 없음';
          else if (shipment.dutyExempt && shipment.vatExempt) status = '면세 한도 이하 · 세금 없음';
          else if (shipment.dutyExempt) status = '관세 면제 · 부가세 과세';
          else status = `과세 · 관세 ${formatPercent(rule.dutyRate)}, 부가세 ${formatPercent(rule.vatRate)}`;

          return (
            <li key={shipment.origin} className="rounded-sm border border-line bg-wall-raised/60 p-3">
              <p className="flex flex-wrap items-baseline justify-between gap-2">
                <span>{route}</span>
                <span className="text-sm text-ink-muted">{status}</span>
              </p>
              <dl className="mt-2 text-sm">
                <Row term="물품가격" value={formatKRW(shipment.goods)} />
                <Row term={shipment.domestic ? '국내 배송비' : '국제 배송비'} value={formatKRW(shipment.shipping)} />
                {!shipment.domestic ? (
                  <>
                    <Row
                      term={`과세가격 (${rule.valuation === 'CIF' ? '물품가격+운임' : '물품가격'})`}
                      value={formatKRW(shipment.dutiableValue)}
                    />
                    <Row term="관세" value={formatKRW(shipment.duty)} />
                    <Row
                      term={estimate.destination === 'KR' ? '부가세' : '부가세·소비세'}
                      value={formatKRW(shipment.vat)}
                    />
                  </>
                ) : null}
              </dl>
            </li>
          );
        })}
      </ul>

      <dl>
        <Row term="상품 합계" value={formatKRW(totals.goods)} />
        <Row term="배송비" value={formatKRW(totals.shipping)} />
        <Row term="관세 예상" value={formatKRW(totals.duty)} />
        <Row term="부가세 예상" value={formatKRW(totals.vat)} />
        <Row term="결제 예정 금액" value={formatKRW(totals.total)} strong />
      </dl>
      {showLocalCurrency && rule.currency !== 'KRW' ? (
        <p className="text-right text-sm text-ink-muted">
          약 {formatCurrency(toCurrency(totals.total, rule.currency, config), rule.currency)} (환율 1{rule.currency} ={' '}
          {formatKRW(config.exchangeRates[rule.currency])})
        </p>
      ) : null}
      <p className="text-sm text-ink-muted">
        면세 한도 {formatCurrency(rule.dutyFreeLimit, rule.limitCurrency)}
        {rule.originLimits
          ? Object.entries(rule.originLimits)
              .map(
                ([origin, limit]) =>
                  ` (${COUNTRY_NAME[origin as keyof typeof COUNTRY_NAME]}발 ${formatCurrency(limit, rule.limitCurrency)})`,
              )
              .join('')
          : null}
        . 실제 세액은 통관 시점의 환율과 품목 분류에 따라 달라질 수 있는 예상액입니다.
      </p>
    </div>
  );
}

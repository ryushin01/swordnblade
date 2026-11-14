import { useLocale, useTranslations } from 'next-intl';

import { formatKRW, type Locale } from '@snb/domain';

import { cn } from '@/shared/lib/utils';

interface PriceTagProps {
  /** 지금 내는 값 */
  price: number;
  /** 할인 전 값. 없거나 price보다 크지 않으면 할인이 없는 것으로 봅니다. */
  listPrice?: number;
  /** 할인율(%). 주면 'n% 할인'을 함께 보여 줍니다. */
  rate?: number;
  /** lg: 상세 화면처럼 판매가를 크게, 정가와 할인율은 작게 */
  size?: 'inherit' | 'lg';
  className?: string;
}

/**
 * 금액. 할인 중이면 정가에 줄을 긋고 할인가와 할인율을 함께 보여 줍니다.
 * 줄 긋기(del)는 화면 낭독기가 읽지 않는 경우가 많아 '정가'·'할인가'를 숨긴 글자로 붙이고,
 * 색만으로 알리지 않도록 할인율도 글자로 씁니다.
 * 낱말 사이 공백은 flex 안에서 화면에 보이지 않지만, 접근 이름이 '정가 68,000원 할인가 …'로 띄어 읽히게 합니다.
 */
export function PriceTag({ price, listPrice, rate, size = 'inherit', className }: PriceTagProps) {
  const t = useTranslations('Price');
  const locale = useLocale() as Locale;
  const lg = size === 'lg';
  if (listPrice === undefined || listPrice <= price) {
    return <span className={cn('tabular-nums', lg && 'text-3xl', className)}>{formatKRW(price, locale)}</span>;
  }
  const minor = lg ? 'text-base' : 'text-[0.8em]';
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5 tabular-nums', lg && 'gap-x-2', className)}>
      <del className={cn(minor, 'text-ink-muted')}>
        <span className="sr-only">{t('list')}</span> {formatKRW(listPrice, locale)}
      </del>{' '}
      <span className={cn(lg && 'text-3xl')}>
        <span className="sr-only">{t('sale')}</span> {formatKRW(price, locale)}
      </span>
      {rate ? (
        <>
          {' '}
          <span className={cn(minor, 'text-accent')}>{t('off', { rate })}</span>
        </>
      ) : null}
    </span>
  );
}

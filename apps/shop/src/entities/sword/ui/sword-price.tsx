'use client';

import { priceOf, type Sword } from '@snb/domain';

import { useNow } from '@/shared/lib/use-now';
import { PriceTag } from '@/shared/ui';

/** 지금 시각의 판매가. 할인 기간이면 정가·할인가·할인율을 함께 보여 줍니다. */
export function SwordPrice({
  sword,
  size,
  className,
}: {
  sword: Pick<Sword, 'price' | 'discount'>;
  size?: 'inherit' | 'lg';
  className?: string;
}) {
  const { price, listPrice, rate } = priceOf(sword, useNow());
  return <PriceTag price={price} listPrice={listPrice} rate={rate} size={size} className={className} />;
}

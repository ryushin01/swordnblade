'use client';

import { useLocale } from 'next-intl';

import { estimateCustoms, findCountryRule, type Locale, requiresPossessionPermit } from '@snb/domain';

import { useCartHydrated, useCartStore } from '@/entities/cart';
import { localizeForLocale, useSwords } from '@/entities/sword';
import { useCustomsConfig } from '@/entities/tariff';

/**
 * 장바구니 품목을 상품 정보와 합치고, 고른 배송지 기준으로 관세와 소지 허가 여부를 계산합니다.
 * 장바구니와 주문서가 함께 써서 두 화면의 금액이 늘 같습니다.
 * - loading: 기기에 저장한 장바구니, 상품 목록, 관세 표를 받는 중
 * - error: 상품 목록이나 관세 표를 받지 못함
 * - ready: 계산 결과(품목이 비었을 수 있음)
 */
export function useCartQuote() {
  const locale = useLocale() as Locale;
  const hydrated = useCartHydrated();
  const lines = useCartStore((state) => state.lines);
  const destination = useCartStore((state) => state.destination);
  const swords = useSwords();
  const config = useCustomsConfig();

  if (!hydrated || swords.isPending || config.isPending) return { status: 'loading' } as const;
  if (swords.isError || config.isError) return { status: 'error' } as const;

  // 판매가 끝나 목록에 없는 상품은 뺍니다.
  const items = lines.flatMap((line) => {
    const sword = swords.data.find((item) => item.id === line.swordId);
    return sword ? [{ line, sword: localizeForLocale(sword, locale) }] : [];
  });
  const estimate = estimateCustoms(
    items.map(({ line, sword }) => ({ origin: sword.origin, unitPrice: sword.price, quantity: line.quantity })),
    destination,
    config.data,
  );
  return {
    status: 'ready',
    destination,
    config: config.data,
    items,
    estimate,
    needsPermit: items.some(({ sword }) => requiresPossessionPermit(sword.specs)),
    rule: findCountryRule(config.data, destination),
  } as const;
}

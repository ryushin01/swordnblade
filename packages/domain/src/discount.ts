import type { Sword } from './types';

/** 도검 할인. 기간은 한국 시간 날짜(YYYY-MM-DD)로 적고, 둘 다 생략할 수 있습니다. */
export interface SwordDiscount {
  /** 할인율(%). 1~90의 정수 */
  rate: number;
  /** 이날 0시(한국 시간)부터. 없으면 바로 */
  startsAt?: string;
  /** 이날 끝까지(한국 시간). 없으면 끝없이 */
  endsAt?: string;
}

export type DiscountStatus = 'active' | 'scheduled' | 'ended';

/** 지금 판매가. rate가 0이면 할인이 없습니다. */
export interface PriceInfo {
  price: number;
  listPrice: number;
  rate: number;
}

// 화면 묶음마다 이 파일이 들어가므로, 입력 검증(validateDiscount)은 discount-validation.ts에 따로 둡니다.
const startOfDay = (date: string) => Date.parse(`${date}T00:00:00+09:00`);
const endOfDay = (date: string) => Date.parse(`${date}T23:59:59.999+09:00`);

export function discountStatus(discount: SwordDiscount, now: number): DiscountStatus {
  if (discount.startsAt && now < startOfDay(discount.startsAt)) return 'scheduled';
  if (discount.endsAt && now > endOfDay(discount.endsAt)) return 'ended';
  return 'active';
}

/** 할인가는 100원 단위로 반올림합니다. */
export const discountedPrice = (price: number, rate: number): number =>
  Math.round((price * (100 - rate)) / 100 / 100) * 100;

export function priceOf(sword: Pick<Sword, 'price' | 'discount'>, now: number): PriceInfo {
  const { discount } = sword;
  if (!discount || discountStatus(discount, now) !== 'active') {
    return { price: sword.price, listPrice: sword.price, rate: 0 };
  }
  return { price: discountedPrice(sword.price, discount.rate), listPrice: sword.price, rate: discount.rate };
}

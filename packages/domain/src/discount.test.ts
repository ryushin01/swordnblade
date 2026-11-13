import { describe, expect, it } from 'vitest';

import { discountedPrice, discountStatus, priceOf } from './discount';
import { validateDiscount } from './discount-validation';

const at = (iso: string) => Date.parse(iso);

describe('할인', () => {
  it('기간은 한국 시간 날짜로, 시작일 0시부터 종료일 끝까지 적용한다', () => {
    const discount = { rate: 10, startsAt: '2026-12-01', endsAt: '2026-12-31' };
    expect(discountStatus(discount, at('2026-11-30T23:59:59+09:00'))).toBe('scheduled');
    expect(discountStatus(discount, at('2026-12-01T00:00:00+09:00'))).toBe('active');
    expect(discountStatus(discount, at('2026-12-31T23:59:59+09:00'))).toBe('active');
    expect(discountStatus(discount, at('2027-01-01T00:00:00+09:00'))).toBe('ended');
    expect(discountStatus({ rate: 10 }, at('2030-01-01T00:00:00Z'))).toBe('active');
  });

  it('할인가는 100원 단위로 반올림한다', () => {
    expect(discountedPrice(17_600_000, 10)).toBe(15_840_000);
    expect(discountedPrice(68_000, 15)).toBe(57_800);
    expect(discountedPrice(12_345, 10)).toBe(11_100);
  });

  it('지금 적용 중일 때만 판매가가 바뀐다', () => {
    const sword = { price: 1_000_000, discount: { rate: 20, startsAt: '2027-01-01' } };
    expect(priceOf(sword, at('2026-12-31T12:00:00+09:00'))).toEqual({
      price: 1_000_000,
      listPrice: 1_000_000,
      rate: 0,
    });
    expect(priceOf(sword, at('2027-01-02T12:00:00+09:00'))).toEqual({ price: 800_000, listPrice: 1_000_000, rate: 20 });
    expect(priceOf({ price: 500_000 }, Date.now())).toEqual({ price: 500_000, listPrice: 500_000, rate: 0 });
  });

  it('할인율·날짜 형식·기간 순서를 확인한다', () => {
    expect(validateDiscount({ rate: 15 })).toBeNull();
    expect(validateDiscount({ rate: 15, startsAt: '2026-12-01', endsAt: '2026-12-01' })).toBeNull();
    expect(validateDiscount({ rate: 0 })).toMatch(/할인율/);
    expect(validateDiscount({ rate: 95 })).toMatch(/할인율/);
    expect(validateDiscount({ rate: 12.5 })).toMatch(/할인율/);
    expect(validateDiscount({ rate: 10, startsAt: '12/01/2026' })).toMatch(/형식/);
    expect(validateDiscount({ rate: 10, startsAt: '2026-12-10', endsAt: '2026-12-01' })).toMatch(/종료일/);
    expect(validateDiscount(null)).not.toBeNull();
  });
});

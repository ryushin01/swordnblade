import type { SwordDiscount } from './discount';

export const MIN_DISCOUNT_RATE = 1;
export const MAX_DISCOUNT_RATE = 90;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 할인 값이 맞지 않으면 고치는 방법을 담은 문구를, 맞으면 null을 돌려줍니다. */
export function validateDiscount(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return '할인 정보가 맞지 않습니다.';
  const { rate, startsAt, endsAt } = value as Partial<Record<keyof SwordDiscount, unknown>>;
  if (!Number.isInteger(rate) || (rate as number) < MIN_DISCOUNT_RATE || (rate as number) > MAX_DISCOUNT_RATE) {
    return `할인율은 ${MIN_DISCOUNT_RATE}~${MAX_DISCOUNT_RATE} 사이의 정수로 입력해 주세요.`;
  }
  for (const date of [startsAt, endsAt]) {
    if (
      date !== undefined &&
      (typeof date !== 'string' || !DATE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00+09:00`)))
    ) {
      return '할인 기간은 YYYY-MM-DD 형식의 날짜로 입력해 주세요.';
    }
  }
  if (typeof startsAt === 'string' && typeof endsAt === 'string' && endsAt < startsAt) {
    return '할인 종료일을 시작일과 같거나 뒤로 정해 주세요.';
  }
  return null;
}

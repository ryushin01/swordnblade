import type { SwordDiscount } from './discount';

export const MIN_DISCOUNT_RATE = 1;
export const MAX_DISCOUNT_RATE = 90;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 달력에 있는 날짜인지 봅니다. Date.parse는 2027-02-30을 3월 2일로 넘겨 받아 주므로 연·월·일을 되짚어 확인합니다. */
const isCalendarDate = (value: string): boolean => {
  if (!DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

/** 할인 값이 맞지 않으면 고치는 방법을 담은 문구를, 맞으면 null을 돌려줍니다. */
export function validateDiscount(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return '할인 정보가 맞지 않습니다.';
  const { rate, startsAt, endsAt } = value as Partial<Record<keyof SwordDiscount, unknown>>;
  if (!Number.isInteger(rate) || (rate as number) < MIN_DISCOUNT_RATE || (rate as number) > MAX_DISCOUNT_RATE) {
    return `할인율은 ${MIN_DISCOUNT_RATE}~${MAX_DISCOUNT_RATE} 사이의 정수로 입력해 주세요.`;
  }
  for (const date of [startsAt, endsAt]) {
    if (date !== undefined && (typeof date !== 'string' || !isCalendarDate(date))) {
      return '할인 기간은 YYYY-MM-DD 형식의 날짜로 입력해 주세요.';
    }
  }
  if (typeof startsAt === 'string' && typeof endsAt === 'string' && endsAt < startsAt) {
    return '할인 종료일을 시작일과 같거나 뒤로 정해 주세요.';
  }
  return null;
}

import type { CurrencyCode } from './types';

const krwFormatter = new Intl.NumberFormat('ko-KR');

/** 1,234,000원 */
export const formatKRW = (value: number): string => `${krwFormatter.format(Math.round(value))}원`;

export function formatCurrency(value: number, currency: CurrencyCode): string {
  if (currency === 'KRW') return formatKRW(value);
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(value);
}

export const formatPercent = (rate: number): string =>
  `${(rate * 100).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`;

/** mm → "71 cm" */
export const formatLength = (mm: number): string =>
  `${(mm / 10).toLocaleString('ko-KR', { maximumFractionDigits: 1 })} cm`;

/** g → "1.2 kg" */
export const formatWeight = (g: number): string =>
  g >= 1000 ? `${(g / 1000).toLocaleString('ko-KR', { maximumFractionDigits: 2 })} kg` : `${g} g`;

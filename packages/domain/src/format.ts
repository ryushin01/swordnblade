import type { CurrencyCode, Locale } from './types';

const INTL_LOCALE: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US' };

/** ko: 1,234,000원 · en: ₩1,234,000 */
export function formatKRW(value: number, locale: Locale = 'ko'): string {
  const rounded = Math.round(value);
  if (locale === 'ko') return `${new Intl.NumberFormat('ko-KR').format(rounded)}원`;
  return new Intl.NumberFormat(INTL_LOCALE[locale], { style: 'currency', currency: 'KRW' }).format(rounded);
}

export function formatCurrency(value: number, currency: CurrencyCode, locale: Locale = 'ko'): string {
  if (currency === 'KRW') return formatKRW(value, locale);
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(value);
}

export const formatPercent = (rate: number, locale: Locale = 'ko'): string =>
  `${(rate * 100).toLocaleString(INTL_LOCALE[locale], { maximumFractionDigits: 1 })}%`;

/** mm → "71 cm" */
export const formatLength = (mm: number, locale: Locale = 'ko'): string =>
  `${(mm / 10).toLocaleString(INTL_LOCALE[locale], { maximumFractionDigits: 1 })} cm`;

/** g → "1.2 kg" */
export const formatWeight = (g: number, locale: Locale = 'ko'): string =>
  g >= 1000
    ? `${(g / 1000).toLocaleString(INTL_LOCALE[locale], { maximumFractionDigits: 2 })} kg`
    : `${g.toLocaleString(INTL_LOCALE[locale])} g`;

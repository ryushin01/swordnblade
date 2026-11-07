import { CATEGORY_LABEL, CATEGORY_LABEL_EN, COUNTRY_NAME, ORDER_STATUS_LABEL } from './constants';

import type { CountryCode, CountryRule, Locale, OrderStatus, Sword, SwordCategory, SwordTranslation } from './types';

export const LOCALES: Locale[] = ['ko', 'en'];

export const COUNTRY_NAME_EN: Record<CountryCode, string> = {
  KR: 'South Korea',
  JP: 'Japan',
  CN: 'China',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  NO: 'Norway',
  GR: 'Greece',
  AU: 'Australia',
  CA: 'Canada',
};

export const ORDER_STATUS_LABEL_EN: Record<OrderStatus, string> = {
  paid: 'Paid',
  'permit-review': 'Checking permit',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const countryName = (code: CountryCode, locale: Locale): string =>
  locale === 'en' ? COUNTRY_NAME_EN[code] : COUNTRY_NAME[code];

export const categoryLabel = (category: SwordCategory, locale: Locale): string =>
  locale === 'en' ? CATEGORY_LABEL_EN[category] : CATEGORY_LABEL[category];

export const orderStatusLabel = (status: OrderStatus, locale: Locale): string =>
  locale === 'en' ? ORDER_STATUS_LABEL_EN[status] : ORDER_STATUS_LABEL[status];

export const permitNote = (rule: CountryRule, locale: Locale): string =>
  locale === 'en' ? (rule.permitNoteEn ?? rule.permitNote) : rule.permitNote;

/**
 * 도검의 이름·설명·이야기를 고른 언어로 바꿔 돌려줍니다.
 * 번역이 없으면(어드민에서 새로 만든 도검 등) fallback을 쓰고, 그것도 없으면 한국어 원문을 둡니다.
 */
export function localizeSword(sword: Sword, locale: Locale, fallback?: SwordTranslation): Sword {
  if (locale === 'ko') return sword;
  const translation = sword.translations?.[locale] ?? fallback;
  return {
    ...sword,
    name: sword.nameEn,
    ...(translation
      ? {
          summary: translation.summary,
          description: translation.description,
          era: translation.era,
          stories: translation.stories,
          specs: { ...sword.specs, material: translation.material },
        }
      : {}),
  };
}

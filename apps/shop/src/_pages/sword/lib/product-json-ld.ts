import { SITE } from '@/shared/config';

import type { Sword } from '@snb/domain';

/** 도검별 공유 이미지 주소. 파일은 scripts/generate-og.mjs로 만듭니다. */
export const swordOgImage = (slug: string) => `/og/swords/${slug}.jpg`;

/** 상품 구조화 데이터(schema.org Product). script 안에 바로 넣을 수 있게 '<'를 바꿔 돌려줍니다. */
export function productJsonLd(sword: Sword, locale: string): string {
  const url = `${SITE.url}${locale === 'en' ? '/en' : ''}/swords/${sword.slug}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sword.name,
    description: sword.summary,
    image: `${SITE.url}${swordOgImage(sword.slug)}`,
    url,
    offers: {
      '@type': 'Offer',
      url,
      price: sword.price,
      priceCurrency: 'KRW',
      availability: `https://schema.org/${sword.stock > 0 ? 'InStock' : 'OutOfStock'}`,
    },
  }).replace(/</g, '\\u003c');
}

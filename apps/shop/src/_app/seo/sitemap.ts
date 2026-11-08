import { SEED_SWORDS } from '@snb/mocks';

import { SITE } from '@/shared/config';

import type { MetadataRoute } from 'next';

/** 한국어·영어 주소를 모두 싣고, 각 주소에 짝이 되는 언어 주소를 알려 줍니다. */
export function buildSitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/compare', '/timeline', ...SEED_SWORDS.map((sword) => `/swords/${sword.slug}`)];
  return paths.flatMap((path) => {
    const ko = `${SITE.url}${path || '/'}`;
    const en = `${SITE.url}/en${path}`;
    const alternates = { languages: { ko, en } };
    return [
      { url: ko, alternates },
      { url: en, alternates },
    ];
  });
}

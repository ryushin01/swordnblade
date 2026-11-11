import { SITE } from '@/shared/config';

import type { MetadataRoute } from 'next';

/** 찾지 않게 할 화면은 각 페이지의 noindex로 막습니다(robots로 막으면 noindex를 읽지 못합니다). */
export function buildRobots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE.url}/sitemap.xml` };
}

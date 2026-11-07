import { defineRouting } from 'next-intl/routing';

/**
 * 한국어는 지금 주소(/) 그대로, 영어는 /en 아래에 둡니다.
 * 주소가 언어마다 달라 공유·검색에 쓸 수 있고, 어드민(/admin)과 Storybook은 언어 경로를 거치지 않습니다.
 */
export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
  // 브라우저 언어로 자동 이동하지 않고 사용자가 고른 주소를 따릅니다.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

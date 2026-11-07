import createMiddleware from 'next-intl/middleware';

import { routing } from './shared/i18n';

/** 언어 경로를 처리합니다. 어드민·Storybook·API·정적 파일은 건드리지 않습니다. */
export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|admin|storybook|_next|_vercel|.*\\..*).*)'],
};

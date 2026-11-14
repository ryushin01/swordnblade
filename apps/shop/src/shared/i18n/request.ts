import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    // 할인 기간을 가르는 '지금'. 브라우저는 이 값으로 hydrate한 뒤 자기 시계로 바꿉니다.
    now: new Date(),
    timeZone: 'Asia/Seoul',
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

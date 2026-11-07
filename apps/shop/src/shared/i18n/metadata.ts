import type { AppLocale } from './routing';

/** 언어마다 다른 주소를 검색 엔진에 알립니다(hreflang). path는 언어 경로를 뺀 주소입니다. */
export function languageAlternates(path: string, locale: AppLocale) {
  const ko = path === '' ? '/' : path;
  const en = `/en${path}`;
  return {
    canonical: locale === 'en' ? en : ko,
    languages: { ko, en, 'x-default': ko },
  };
}

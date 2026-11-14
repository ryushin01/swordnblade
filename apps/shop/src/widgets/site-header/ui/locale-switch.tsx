'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { getPathname, routing, usePathname } from '@/shared/i18n';
import { cn } from '@/shared/lib';

/**
 * 지금 보고 있는 주소와 검색 조건을 그대로 두고 언어만 바꿉니다.
 * 언어를 바꾸면 루트 레이아웃([locale])이 통째로 바뀌므로 클라이언트 이동 대신 문서를 새로 받습니다(<a>).
 * 클라이언트 이동이면 화면 전환(SSGOI) 제공자까지 다시 만들어지면서 떠나는 화면이 지워지지 않고 남습니다.
 * <a>는 미리 불러오기를 하지 않으므로, 언어별 주소를 미리 불러올 때 /ko/... 리디렉션으로 페이지가 다시 열려 Mock API 시작이 끊기는 문제도 생기지 않습니다.
 * 링크 글자는 그 언어로 쓰고 lang·hrefLang을 붙여 화면낭독기가 그 언어로 읽게 합니다.
 */
export function LocaleSwitch({ className }: { className?: string }) {
  const params = useSearchParams();
  return <LocaleLinks query={Object.fromEntries(params.entries())} className={className} />;
}

/**
 * 언어 링크. 검색 조건(useSearchParams)은 정적으로 그리는 화면에서 브라우저에서만 읽히므로,
 * 서버 HTML(Suspense 대기 화면)에는 검색 조건 없이 같은 모양으로 그려 둡니다.
 * 대기 화면이 비어 있으면 hydrate 뒤에 링크가 생기며 모바일 머리글이 두 줄이 되어 본문이 밀립니다(CLS).
 */
export function LocaleLinks({ query = {}, className }: { query?: Record<string, string>; className?: string }) {
  const t = useTranslations('Header');
  const locale = useLocale();
  const pathname = usePathname();
  // 빈 검색 조건을 넘기면 주소가 '/en?'처럼 물음표로 끝나므로, 조건이 있을 때만 붙입니다.
  const href = Object.keys(query).length > 0 ? { pathname, query } : pathname;

  return (
    <nav aria-label={t('languageNav')} className={className}>
      <ul className="flex items-center text-sm small-caps">
        {routing.locales.map((value, index) => (
          <li key={value} className="flex items-center">
            {index > 0 ? (
              <span aria-hidden="true" className="px-0.5 text-ink-muted">
                ·
              </span>
            ) : null}
            <a
              href={getPathname({ href, locale: value })}
              lang={value}
              hrefLang={value}
              aria-current={value === locale ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center px-1.5 text-ink-muted hover:text-ink sm:px-2',
                value === locale && 'text-ink underline decoration-accent decoration-1 underline-offset-8',
              )}
            >
              {value === 'ko' ? t('korean') : t('english')}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

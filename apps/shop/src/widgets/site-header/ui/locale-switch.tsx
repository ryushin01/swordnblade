'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { Link, routing, usePathname } from '@/shared/i18n';
import { cn } from '@/shared/lib';

/**
 * 지금 보고 있는 주소와 검색 조건을 그대로 두고 언어만 바꿉니다.
 * 링크 글자는 그 언어로 쓰고 lang·hrefLang을 붙여 화면낭독기가 그 언어로 읽게 합니다.
 */
export function LocaleSwitch({ className }: { className?: string }) {
  const t = useTranslations('Header');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = Object.fromEntries(params.entries());

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
            <Link
              href={{ pathname, query }}
              locale={value}
              lang={value}
              hrefLang={value}
              aria-current={value === locale ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center px-2 text-ink-muted hover:text-ink',
                value === locale && 'text-ink underline decoration-accent decoration-1 underline-offset-8',
              )}
            >
              {value === 'ko' ? t('korean') : t('english')}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

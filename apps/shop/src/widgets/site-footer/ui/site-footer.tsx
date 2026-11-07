import { useTranslations } from 'next-intl';

import { Wordmark } from '@/shared/ui';

export function SiteFooter() {
  const t = useTranslations('Footer');
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[90rem] gap-4 px-4 py-10 text-sm text-ink-muted sm:px-8">
        <Wordmark className="opacity-90" />
        <p>{t('disclaimer')}</p>
        <p>{t('customs')}</p>
        <p>
          {/* 어드민은 다른 앱(zone)이라 언어 경로 없이 일반 링크로 이동합니다. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- 어드민은 다른 앱(zone)이라 전체 페이지 이동이 맞습니다. */}
          <a
            href="/admin"
            hrefLang="ko"
            className="inline-flex min-h-11 items-center text-ink underline underline-offset-4"
          >
            {t('adminLink')}
          </a>
          <span>{t('adminNote')}</span>
        </p>
        <p lang="en" className="small-caps">
          {t('tagline')}
        </p>
      </div>
    </footer>
  );
}

import { Cormorant_Garamond } from 'next/font/google';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SITE } from '@/shared/config';
import { languageAlternates, routing } from '@/shared/i18n';
import { Toaster } from '@/shared/ui';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

import { Providers } from '../query-client/providers';
import { PageTransitions } from '../transitions/page-transitions';
import { RouteBoundary } from '../transitions/route-boundary';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import '../styles/globals.css';

/**
 * 칼 이름의 한글만 붓글씨(나눔손글씨 붓)로 씁니다. 이름에 쓰인 247자만 담은 66KB 파일이라 본문 한글 웹 글꼴과 달리 가볍습니다.
 * 붓글씨는 글자가 작아 보여 크기를 키우고, 없는 글자(영문, 새로 더한 이름의 글자)는 아래 명조로 이어집니다.
 */
const swordBrush = localFont({
  src: '../fonts/sword-brush.woff2',
  variable: '--font-sword-brush',
  display: 'swap',
  declarations: [{ prop: 'size-adjust', value: '125%' }],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

type LayoutParams = Promise<{ locale: string }>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: LayoutParams }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    // 언어별 대체 주소(hreflang)와 canonical을 절대 주소로 내보냅니다. 하위 페이지에도 적용됩니다.
    metadataBase: new URL(SITE.url),
    // 아이콘이 없으면 브라우저가 /favicon.ico를 찾다가 404를 냅니다.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: '/apple-touch-icon.png',
    },
    title: { default: t('defaultTitle'), template: `%s · ${t('siteName')}` },
    description: t('description'),
    alternates: languageAlternates('', locale),
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      title: t('defaultTitle'),
      description: t('description'),
      locale: locale === 'en' ? 'en_US' : 'ko_KR',
      images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: t('defaultTitle') }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: '#dddcd7',
};

export async function RootLayout({ children, params }: { children: ReactNode; params: LayoutParams }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // 정적으로 그릴 수 있게 이 요청의 언어를 알려 둡니다.
  setRequestLocale(locale);
  const t = await getTranslations('Common');

  return (
    <html lang={locale} className={`${cormorant.variable} ${swordBrush.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-4 py-3 text-wall focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>
          <Providers>
            <PageTransitions>
              <SiteHeader />
              {/* 화면 전환: 떠나는 화면은 main을 기준으로 겹쳐 놓입니다(relative·z-0). overflow-x는 hidden이 아니라 clip이어야
                  스크롤 복원이 맞습니다. 404 화면도 경계 안에 있어야 다른 화면에서 넘어올 때 떠나는 화면이 지워집니다. */}
              <main id="main" tabIndex={-1} className="relative z-0 min-h-dvh overflow-x-clip outline-none">
                <RouteBoundary className="min-h-dvh bg-wall">{children}</RouteBoundary>
              </main>
              <SiteFooter />
              <Toaster position="bottom-center" />
            </PageTransitions>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

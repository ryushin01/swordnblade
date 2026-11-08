import { Cormorant_Garamond } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SITE } from '@/shared/config';
import { languageAlternates, routing } from '@/shared/i18n';
import { Toaster } from '@/shared/ui';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

import { Providers } from '../query-client/providers';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import '../styles/globals.css';

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
    icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
    title: { default: t('defaultTitle'), template: `%s · ${t('siteName')}` },
    description: t('description'),
    alternates: languageAlternates('', locale),
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
    <html lang={locale} className={`${cormorant.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-4 py-3 text-wall focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>
          <Providers>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <SiteFooter />
            <Toaster position="bottom-center" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

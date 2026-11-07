import { Cormorant_Garamond } from 'next/font/google';

import { SITE } from '@/shared/config';
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

export const metadata: Metadata = {
  title: { default: `${SITE.name} · 도검의 벽`, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: '#dddcd7',
};

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${cormorant.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-4 py-3 text-wall focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          본문 바로가기
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
          <Toaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  );
}

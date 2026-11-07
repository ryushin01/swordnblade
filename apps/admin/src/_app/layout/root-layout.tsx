import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AdminShell } from '@/widgets/admin-shell';
import { SITE } from '@/shared/config';
import { Providers } from '../query-client/providers';
import './global.css';

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  robots: { index: false, follow: false },
};

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AntdRegistry>
          <Providers>
            <AdminShell>{children}</AdminShell>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}

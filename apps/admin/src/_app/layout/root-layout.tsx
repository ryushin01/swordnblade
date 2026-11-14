import { AntdRegistry } from '@ant-design/nextjs-registry';

import { SITE } from '@/shared/config';
import { AdminShell } from '@/widgets/admin-shell';

import { Providers } from '../query-client/providers';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './global.css';

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  robots: { index: false, follow: false },
  // 메타데이터 주소에는 basePath가 붙지 않아 /admin을 직접 적습니다.
  icons: { icon: { url: '/admin/favicon.svg', type: 'image/svg+xml' } },
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

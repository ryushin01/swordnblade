'use client';

import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';

import 'dayjs/locale/ko';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, retry: 1, refetchOnWindowFocus: false } } }),
  );
  return (
    <ConfigProvider
      locale={koKR}
      theme={{
        // 기본 테마에서 명도 대비(4.5:1)가 모자란 토큰만 Ant Design 팔레트 안의 진한 색으로 바꿉니다.
        token: {
          colorPrimary: '#0958d9',
          colorLink: '#0958d9',
          colorError: '#cf1322',
          colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
          colorTextDescription: 'rgba(0, 0, 0, 0.65)',
          colorTextPlaceholder: 'rgba(0, 0, 0, 0.6)',
        },
      }}
    >
      <App>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </App>
    </ConfigProvider>
  );
}

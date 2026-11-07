import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { Preview } from '@storybook/nextjs-vite';

import '../src/_app/styles/globals.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wall', values: [{ name: 'wall', value: '#dddcd7' }] },
    nextjs: { appDirectory: true },
    // 접근성 위반이 있으면 스토리 테스트를 실패로 처리합니다.
    a11y: { test: 'error' },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div lang="ko" style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif" }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default preview;

import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import en from '../src/shared/i18n/messages/en.json';
import ko from '../src/shared/i18n/messages/ko.json';

import type { Preview } from '@storybook/nextjs-vite';

import '../src/_app/styles/globals.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const MESSAGES = { ko, en } as const;

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wall', values: [{ name: 'wall', value: '#dddcd7' }] },
    nextjs: { appDirectory: true },
    // 접근성 위반이 있으면 스토리 테스트를 실패로 처리합니다.
    a11y: { test: 'error' },
  },
  // 도구 막대에서 언어를 바꿔 볼 수 있습니다.
  globalTypes: {
    locale: {
      description: '화면 언어',
      toolbar: {
        title: '언어',
        icon: 'globe',
        items: [
          { value: 'ko', title: '한국어' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'ko' },
  decorators: [
    (Story, context) => {
      const locale = (context.globals.locale ?? 'ko') as keyof typeof MESSAGES;
      return (
        <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Asia/Seoul">
          <QueryClientProvider client={queryClient}>
            <div lang={locale} style={{ fontFamily: "'Cormorant Garamond', AppleMyungjo, serif" }}>
              <Story />
            </div>
          </QueryClientProvider>
        </NextIntlClientProvider>
      );
    },
  ],
};

export default preview;

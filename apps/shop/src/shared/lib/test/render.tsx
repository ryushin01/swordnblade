import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import en from '@/shared/i18n/messages/en.json';
import ko from '@/shared/i18n/messages/ko.json';

import type { ReactElement } from 'react';

const MESSAGES = { ko, en };

/** 테스트마다 새 QueryClient와 번역(기본 한국어)으로 감싸 렌더합니다. */
export function renderWithProviders(ui: ReactElement, { locale = 'ko' }: { locale?: 'ko' | 'en' } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Asia/Seoul">
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

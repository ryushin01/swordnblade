import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

afterEach(() => cleanup());

// Next 라우터 없이 컴포넌트를 렌더하도록 next/navigation을 흉내 냅니다(next-intl Link·router가 씁니다).
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({}),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  redirect: vi.fn(),
}));

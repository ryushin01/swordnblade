import type { ApiError } from '@snb/mocks';
import { SITE } from '../config';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(status: number, body: Partial<ApiError>) {
    super(body.message ?? '요청을 처리하지 못했습니다.');
    this.name = 'ApiRequestError';
    this.status = status;
    this.fields = body.fields ?? {};
  }
}

let mockReady: Promise<unknown> | null = null;

/**
 * 브라우저에서는 첫 요청 전에 Mock API(MSW)를 켭니다.
 * 테스트처럼 Node용 Mock 서버를 따로 쓰는 환경에서는 NEXT_PUBLIC_API_MOCKING=off로 끕니다.
 */
async function ensureMockApi() {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_API_MOCKING === 'off') return;
  if (!mockReady) {
    mockReady = import('@snb/mocks/browser').then(({ startMockApi }) =>
      startMockApi({ storageKey: SITE.mockStorageKey }),
    );
  }
  await mockReady;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureMockApi();
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Partial<ApiError>;
    throw new ApiRequestError(response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

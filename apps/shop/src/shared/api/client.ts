import { SITE } from '../config';

import type { ApiError } from '@snb/mocks';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;
  /** 화면이 따로 안내해야 하는 오류 종류(예: price-changed) */
  readonly code?: ApiError['code'];
  /** price-changed일 때 서버가 다시 계산한 결제 금액 */
  readonly total?: number;

  constructor(status: number, body: Partial<ApiError>) {
    super(body.message ?? '요청을 처리하지 못했습니다.');
    this.name = 'ApiRequestError';
    this.status = status;
    this.fields = body.fields ?? {};
    this.code = body.code;
    this.total = body.total;
  }
}

let mockReady: Promise<unknown> | null = null;
let authToken: string | null = null;

/** 로그인 세션 토큰. entities/session이 로그인·복원·로그아웃 때 알려 줍니다. */
export function setApiAuthToken(token: string | null) {
  authToken = token;
}

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
  try {
    await mockReady;
  } catch (error) {
    // 시작하지 못했으면 다음 요청에서 다시 시도하도록 비웁니다.
    mockReady = null;
    throw error;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureMockApi();
  const response = await fetch(path, {
    ...init,
    headers: {
      // FormData(사진 올리기)는 브라우저가 경계값을 넣은 Content-Type을 직접 붙입니다.
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Partial<ApiError>;
    throw new ApiRequestError(response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

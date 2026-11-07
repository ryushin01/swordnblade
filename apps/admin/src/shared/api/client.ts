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
 * 쇼핑몰 주소의 /admin에서 열렸으면 쇼핑몰과 같은 워커(/mockServiceWorker.js)를 함께 씁니다.
 * 어드민만 따로 열렸으면(로컬 개발, 단독 주소) 루트에 워커가 없으므로 basePath 아래 워커를 씁니다.
 */
async function findServiceWorker(): Promise<{ serviceWorkerUrl: string; serviceWorkerScope?: string }> {
  const shared = '/mockServiceWorker.js';
  try {
    const response = await fetch(shared, { method: 'HEAD' });
    if (response.ok) return { serviceWorkerUrl: shared };
  } catch {
    // 네트워크 오류면 아래 경로를 씁니다.
  }
  // 범위를 /admin으로 넓혀 끝 슬래시 없는 /admin(대시보드)도 맡게 합니다(Service-Worker-Allowed 헤더 필요).
  return { serviceWorkerUrl: `${SITE.basePath}/mockServiceWorker.js`, serviceWorkerScope: SITE.basePath };
}

/**
 * 브라우저에서는 첫 요청 전에 Mock API(MSW)를 켭니다.
 * 테스트처럼 Node용 Mock 서버를 따로 쓰는 환경에서는 NEXT_PUBLIC_API_MOCKING=off로 끕니다.
 */
async function ensureMockApi() {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_API_MOCKING === 'off') return;
  if (!mockReady) {
    mockReady = Promise.all([import('@snb/mocks/browser'), findServiceWorker()]).then(([{ startMockApi }, worker]) =>
      startMockApi({ storageKey: SITE.mockStorageKey, ...worker }),
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

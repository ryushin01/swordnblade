import { setupWorker } from 'msw/browser';

import { createDb } from './db';
import { createHandlers } from './handlers';
import { createIndexedDbImageStore } from './image-store';

let started: Promise<unknown> | null = null;

/**
 * 브라우저에서 Mock API를 켭니다. 여러 번 불러도 한 번만 시작합니다.
 * 데이터는 localStorage(storageKey)에 남아 새로고침해도 유지됩니다.
 */
export function startMockApi(options: {
  storageKey: string;
  latency?: number;
  serviceWorkerUrl?: string;
  /** 워커가 맡을 범위. 기본은 워커 파일이 있는 폴더 */
  /** 시작을 기다리는 최대 시간(ms) */
  startTimeout?: number;
  serviceWorkerScope?: string;
}) {
  if (!started) {
    const db = createDb({ storageKey: options.storageKey });
    const worker = setupWorker(
      ...createHandlers(db, {
        latency: options.latency ?? 250,
        images: createIndexedDbImageStore(),
        requireAdmin: true,
      }),
    );
    started = withStartTimeout(
      worker.start({
        onUnhandledFrame: 'bypass',
        quiet: true,
        serviceWorker: {
          url: options.serviceWorkerUrl ?? '/mockServiceWorker.js',
          options: options.serviceWorkerScope ? { scope: options.serviceWorkerScope } : undefined,
        },
      }),
      options.startTimeout ?? START_TIMEOUT,
    );
  }
  return started;
}

/** 서비스 워커 시작을 기다리는 최대 시간 */
const START_TIMEOUT = 10_000;
const RELOAD_FLAG = '__snb_mock_reload__';

/**
 * 페이지가 새로 열리는 도중 등록이 끊기면 서비스 워커 시작이 끝나지 않아 화면이 '불러오는 중'에 머물 수 있습니다.
 * 제한 시간을 넘기면 한 번만 새로고침해 다시 시작하고, 그래도 안 되면 오류로 알려 화면이 다시 시도할 수 있게 합니다.
 */
function withStartTimeout<T>(start: Promise<T>, timeout: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limit = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      started = null;
      // 새로고침은 한 번만 합니다. 표시를 남기지 못하는 환경(세션 저장소 사용 불가)에서는 새로고침이 반복될 수 있어 하지 않습니다.
      const firstTimeout = safeSession(() => sessionStorage.getItem(RELOAD_FLAG)) === null;
      const marked =
        firstTimeout &&
        safeSession(() => {
          sessionStorage.setItem(RELOAD_FLAG, '1');
          return sessionStorage.getItem(RELOAD_FLAG);
        }) === '1';
      if (marked) window.location.reload();
      // 새로고침이 일어나지 않아도 화면이 다시 불러오기를 보여 줄 수 있게 언제나 실패로 알립니다.
      reject(new Error('Mock API를 시작하지 못했습니다.'));
    }, timeout);
  });
  return Promise.race([start, limit]).then(
    (value) => {
      clearTimeout(timer);
      safeSession(() => sessionStorage.removeItem(RELOAD_FLAG));
      return value;
    },
    (error: unknown) => {
      // 먼저 실패했으면 타이머를 멈추고, 다음 요청에서 다시 시작하도록 비웁니다. 새로고침 표시는 성공할 때까지 둡니다.
      clearTimeout(timer);
      started = null;
      throw error;
    },
  );
}

function safeSession<T>(read: () => T): T | null {
  try {
    return read();
  } catch {
    return null;
  }
}

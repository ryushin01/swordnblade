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
    started = worker.start({
      onUnhandledFrame: 'bypass',
      quiet: true,
      serviceWorker: {
        url: options.serviceWorkerUrl ?? '/mockServiceWorker.js',
        options: options.serviceWorkerScope ? { scope: options.serviceWorkerScope } : undefined,
      },
    });
  }
  return started;
}

import { setupServer } from 'msw/node';
import { createDb } from './db';
import { createHandlers } from './handlers';

/** 테스트용 Mock 서버. 저장소 없이 메모리로만 동작합니다. */
export function createMockServer() {
  const db = createDb();
  const server = setupServer(...createHandlers(db));
  return { server, db };
}

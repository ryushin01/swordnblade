import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createDb } from './db';
import { createHandlers } from './handlers';
import { createIndexedDbImageStore, ImageStoreUnavailableError } from './image-store';

describe('createIndexedDbImageStore', () => {
  it('IndexedDB가 없으면 메모리에 두지 않고 올리기를 거절한다', async () => {
    // Node 테스트 환경에는 indexedDB가 없습니다.
    const store = createIndexedDbImageStore();
    await expect(store.put('a', { type: 'image/png', data: new ArrayBuffer(1) })).rejects.toBeInstanceOf(
      ImageStoreUnavailableError,
    );
    expect(await store.get('a')).toBeUndefined();
  });
});

describe('POST /api/images (저장 실패)', () => {
  const server = setupServer(...createHandlers(createDb(), { images: createIndexedDbImageStore() }));
  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
  afterAll(() => server.close());

  it('저장하지 못하면 주소를 돌려주지 않고 507로 알린다', async () => {
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }), 'a.png');
    const response = await fetch('http://localhost/api/images', { method: 'POST', body: form });
    expect(response.status).toBe(507);
  });
});

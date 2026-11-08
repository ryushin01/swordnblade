export interface StoredImage {
  type: string;
  data: ArrayBuffer;
}

export interface ImageStore {
  put: (id: string, image: StoredImage) => Promise<void>;
  get: (id: string) => Promise<StoredImage | undefined>;
}

const DB_NAME = 'snb-images';
const STORE = 'images';

/** 메모리 저장소(테스트, IndexedDB를 못 쓰는 환경) */
export function createMemoryImageStore(): ImageStore {
  const map = new Map<string, StoredImage>();
  return {
    put: async (id, image) => void map.set(id, image),
    get: async (id) => map.get(id),
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** IndexedDB를 쓸 수 없어 사진을 오래 둘 곳이 없을 때 */
export class ImageStoreUnavailableError extends Error {
  constructor() {
    super('이 브라우저에서는 사진을 저장할 수 없습니다.');
    this.name = 'ImageStoreUnavailableError';
  }
}

/**
 * 사진은 용량이 커서 localStorage(약 5MB) 대신 IndexedDB에 둡니다.
 * 쇼핑몰과 어드민(/admin)이 같은 출처라 같은 저장소를 함께 씁니다.
 * IndexedDB를 열지 못하면(사생활 보호 모드 등) 올리기를 거절합니다. 메모리에만 두면 상품에는 주소가 남는데
 * 새로고침 뒤 사진이 사라지기 때문입니다.
 */
export function createIndexedDbImageStore(): ImageStore {
  let dbPromise: Promise<IDBDatabase | null> | null = null;
  const db = () => {
    dbPromise ??= typeof indexedDB === 'undefined' ? Promise.resolve(null) : openDb().catch(() => null);
    return dbPromise;
  };
  const run = <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) =>
    db().then(
      (database) =>
        database &&
        new Promise<T>((resolve, reject) => {
          // 요청이 성공해도 용량 부족 등으로 트랜잭션이 취소될 수 있어, 커밋이 끝난 뒤에 성공으로 봅니다.
          const transaction = database.transaction(STORE, mode);
          const request = action(transaction.objectStore(STORE));
          transaction.oncomplete = () => resolve(request.result);
          transaction.onabort = () =>
            reject(transaction.error ?? new DOMException('사진 저장이 취소되었습니다.', 'AbortError'));
          request.onerror = () => reject(request.error);
        }),
    );

  return {
    put: async (id, image) => {
      const database = await db();
      if (!database) throw new ImageStoreUnavailableError();
      await run('readwrite', (store) => store.put(image, id));
    },
    get: async (id) => {
      const database = await db();
      if (!database) return undefined;
      return (await run<StoredImage | undefined>('readonly', (store) => store.get(id))) ?? undefined;
    },
  };
}

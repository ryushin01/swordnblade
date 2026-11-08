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

/**
 * 사진은 용량이 커서 localStorage(약 5MB) 대신 IndexedDB에 둡니다.
 * 쇼핑몰과 어드민(/admin)이 같은 출처라 같은 저장소를 함께 씁니다.
 * IndexedDB를 열지 못하면(사생활 보호 모드 등) 메모리로 대신합니다.
 */
export function createIndexedDbImageStore(): ImageStore {
  const fallback = createMemoryImageStore();
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
          const request = action(database.transaction(STORE, mode).objectStore(STORE));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }),
    );

  return {
    put: async (id, image) => {
      const database = await db();
      if (!database) return fallback.put(id, image);
      await run('readwrite', (store) => store.put(image, id));
    },
    get: async (id) => {
      const database = await db();
      if (!database) return fallback.get(id);
      return (await run<StoredImage | undefined>('readonly', (store) => store.get(id))) ?? undefined;
    },
  };
}

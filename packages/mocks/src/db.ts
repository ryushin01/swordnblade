import { type CustomsConfig, DEFAULT_CUSTOMS_CONFIG, type Order, type Sword, type User } from '@snb/domain';

import { SEED_ORDERS, SEED_SWORDS, SEED_VERSION } from './seed';

export interface DbState {
  swords: Sword[];
  orders: Order[];
  customs: CustomsConfig;
  /** 이 데이터를 만든 시드 버전. 없으면 1(버전을 두기 전 데이터) */
  seedVersion?: number;
  /** 회원(비밀번호는 SHA-256 해시). 예전 데이터에는 없을 수 있음 */
  users?: StoredUser[];
  /** 로그인 세션 */
  sessions?: Session[];
}

export interface StoredUser extends User {
  passwordHash: string;
  /** 찜한 도검 id */
  wishlist?: string[];
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

export interface Db {
  read: () => DbState;
  write: (update: (state: DbState) => DbState) => DbState;
  reset: () => void;
}

const clone = <T>(value: T): T => structuredClone(value);

const seedState = (): DbState => ({
  swords: clone(SEED_SWORDS),
  orders: clone(SEED_ORDERS),
  customs: clone(DEFAULT_CUSTOMS_CONFIG),
  seedVersion: SEED_VERSION,
});

/**
 * 예전 시드로 저장된 데이터를 새 시드에 맞춥니다.
 * - 시드 도검: 그림·형태·설명·이야기·번역·제원은 새 시드로 바꾸고, 이름·가격·재고 같은 판매 정보는 그대로 둡니다.
 * - 새 시드에만 있는 도검은 뒤에 더하고, 어드민에서 만든 도검과 주문은 건드리지 않습니다.
 */
export function migrateSeed(state: DbState): DbState {
  if ((state.seedVersion ?? 1) >= SEED_VERSION) return state;
  const byId = new Map(state.swords.map((sword) => [sword.id, sword]));
  const swords = state.swords.map((sword) => {
    const seed = SEED_SWORDS.find((item) => item.id === sword.id);
    if (!seed) return sword;
    return {
      ...sword,
      kind: seed.kind,
      category: seed.category,
      era: seed.era,
      summary: seed.summary,
      description: seed.description,
      stories: clone(seed.stories),
      specs: { ...clone(seed.specs) },
      art: clone(seed.art),
      ...(seed.translations ? { translations: clone(seed.translations) } : {}),
    };
  });
  const added = SEED_SWORDS.filter((seed) => !byId.has(seed.id)).map(clone);
  return { ...state, swords: [...swords, ...added], seedVersion: SEED_VERSION };
}

/**
 * 메모리 DB. storageKey를 주면 브라우저 localStorage에 저장해 새로고침 후에도 유지합니다.
 * 저장소에 접근할 수 없는 환경(사생활 보호 모드 등)에서는 메모리로만 동작합니다.
 */
export function createDb(options: { storageKey?: string } = {}): Db {
  const { storageKey } = options;

  let needsSave = false;

  /**
   * 저장된 값이 없거나, 저장소를 못 쓰거나, 모양이 맞지 않으면 null.
   * 읽을 때마다 다시 불러오므로 깨진 값 하나가 모든 요청을 막지 않게 모양을 확인합니다.
   */
  const loadStored = (): DbState | null => {
    if (!storageKey) return null;
    try {
      const raw = globalThis.localStorage?.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<DbState> | null;
      if (parsed && Array.isArray(parsed.swords) && Array.isArray(parsed.orders) && parsed.customs) {
        const stored = parsed as DbState;
        if ((stored.seedVersion ?? 1) < SEED_VERSION) {
          // 예전 시드로 저장된 데이터는 새 시드에 맞추고, 저장은 persist가 준비된 뒤에 합니다.
          needsSave = true;
          return migrateSeed(stored);
        }
        return stored;
      }
    } catch {
      // 저장소를 못 쓰거나 JSON이 깨졌으면 메모리 상태를 씁니다.
    }
    return null;
  };

  let state = loadStored() ?? seedState();

  /** 저장된 값이 있을 때만 메모리 상태를 바꿉니다. 없으면 지금 상태를 유지합니다. */
  const refresh = () => {
    const stored = loadStored();
    if (stored) state = stored;
  };

  const persist = () => {
    if (!storageKey) return;
    try {
      globalThis.localStorage?.setItem(storageKey, JSON.stringify(state));
    } catch {
      // 저장 실패는 무시하고 메모리 상태를 유지합니다.
    }
  };
  const saveIfMigrated = () => {
    if (!needsSave) return;
    needsSave = false;
    persist();
  };
  saveIfMigrated();

  return {
    // 같은 출처의 다른 앱(쇼핑몰·어드민)이 바꾼 내용을 보도록 읽을 때마다 저장소에서 다시 불러옵니다.
    read: () => {
      refresh();
      saveIfMigrated();
      return state;
    },
    write: (update) => {
      refresh();
      state = update(clone(state));
      persist();
      return state;
    },
    reset: () => {
      state = seedState();
      persist();
    },
  };
}

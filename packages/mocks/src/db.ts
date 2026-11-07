import { DEFAULT_CUSTOMS_CONFIG, type CustomsConfig, type Order, type Sword } from '@snb/domain';
import { SEED_ORDERS, SEED_SWORDS } from './seed';

export interface DbState {
  swords: Sword[];
  orders: Order[];
  customs: CustomsConfig;
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
});

/**
 * 메모리 DB. storageKey를 주면 브라우저 localStorage에 저장해 새로고침 후에도 유지합니다.
 * 저장소에 접근할 수 없는 환경(사생활 보호 모드 등)에서는 메모리로만 동작합니다.
 */
export function createDb(options: { storageKey?: string } = {}): Db {
  const { storageKey } = options;

  /** 저장된 값이 없거나 저장소를 못 쓰면 null */
  const loadStored = (): DbState | null => {
    if (!storageKey) return null;
    try {
      const raw = globalThis.localStorage?.getItem(storageKey);
      if (raw) return JSON.parse(raw) as DbState;
    } catch {
      // 저장소를 못 쓰면 메모리 상태를 씁니다.
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

  return {
    // 같은 출처의 다른 앱(쇼핑몰·어드민)이 바꾼 내용을 보도록 읽을 때마다 저장소에서 다시 불러옵니다.
    read: () => {
      refresh();
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

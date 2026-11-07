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

  const load = (): DbState => {
    if (!storageKey) return seedState();
    try {
      const raw = globalThis.localStorage?.getItem(storageKey);
      if (raw) return JSON.parse(raw) as DbState;
    } catch {
      // 저장소를 못 쓰면 시드로 시작합니다.
    }
    return seedState();
  };

  let state = load();

  const persist = () => {
    if (!storageKey) return;
    try {
      globalThis.localStorage?.setItem(storageKey, JSON.stringify(state));
    } catch {
      // 저장 실패는 무시하고 메모리 상태를 유지합니다.
    }
  };

  return {
    read: () => state,
    write: (update) => {
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

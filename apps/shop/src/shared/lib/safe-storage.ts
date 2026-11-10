import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const memoryStorage = (): StateStorage => {
  const memory = new Map<string, string>();
  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => void memory.set(key, value),
    removeItem: (key) => void memory.delete(key),
  };
};

/**
 * zustand persist용 저장소. localStorage를 쓸 수 없으면 메모리에만 둡니다.
 * 저장값이 JSON으로 깨져 있으면 지우고 없는 것으로 봅니다. 읽다가 오류가 나면 hydration이 끝나지 않아 화면이 로딩에 머뭅니다.
 */
export const safeJsonStorage = createJSONStorage(() => {
  let storage: StateStorage;
  try {
    const probe = '__snb_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    storage = window.localStorage;
  } catch {
    storage = memoryStorage();
  }
  // 처음에 쓸 수 있었어도 나중에 용량 초과 등으로 실패할 수 있으므로, 실패해도 화면 동작이 멈추지 않게 삼킵니다.
  return {
    getItem: (key) => {
      let raw: string | null;
      try {
        raw = storage.getItem(key) as string | null;
      } catch {
        return null;
      }
      if (raw === null) return null;
      try {
        JSON.parse(raw);
        return raw;
      } catch {
        try {
          void storage.removeItem(key);
        } catch {
          // 지우지 못해도 없는 것으로 봅니다.
        }
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        void storage.setItem(key, value);
      } catch {
        // 저장하지 못하면 이번 탭의 메모리 상태만 유지합니다.
      }
    },
    removeItem: (key) => {
      try {
        void storage.removeItem(key);
      } catch {
        // 지우지 못해도 화면 동작은 이어 갑니다.
      }
    },
  };
});

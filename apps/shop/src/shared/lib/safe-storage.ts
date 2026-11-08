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
  return {
    getItem: (key) => {
      const raw = storage.getItem(key) as string | null;
      if (raw === null) return null;
      try {
        JSON.parse(raw);
        return raw;
      } catch {
        void storage.removeItem(key);
        return null;
      }
    },
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
  };
});

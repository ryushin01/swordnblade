'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setApiAuthToken } from '@/shared/api';
import { SITE } from '@/shared/config';

interface SessionState {
  token: string | null;
  setToken: (token: string | null) => void;
}

/** localStorage를 쓸 수 없으면 메모리에만 둡니다(이 탭에서만 로그인 유지). */
const safeStorage = createJSONStorage(() => {
  try {
    const probe = '__snb_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
      removeItem: (key: string) => void memory.delete(key),
    };
  }
});

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => {
        setApiAuthToken(token);
        set({ token });
      },
    }),
    {
      name: SITE.sessionStorageKey,
      storage: safeStorage,
      // 서버 렌더와 어긋나지 않게 마운트 뒤에 불러옵니다(useSessionHydrated).
      skipHydration: true,
      // 저장된 토큰을 되살리면 API 요청에도 붙도록 알려 줍니다.
      onRehydrateStorage: () => (state) => setApiAuthToken(state?.token ?? null),
    },
  ),
);

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { setApiAuthToken } from '@/shared/api';
import { SITE } from '@/shared/config';
import { safeJsonStorage } from '@/shared/lib/safe-storage';

interface SessionState {
  token: string | null;
  setToken: (token: string | null) => void;
}

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
      storage: safeJsonStorage,
      // 서버 렌더와 어긋나지 않게 마운트 뒤에 불러옵니다(useSessionHydrated).
      skipHydration: true,
      // 저장된 토큰을 되살리면 API 요청에도 붙도록 알려 줍니다.
      onRehydrateStorage: () => (state) => setApiAuthToken(state?.token ?? null),
    },
  ),
);

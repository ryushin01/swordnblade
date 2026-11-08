'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SITE } from '@/shared/config';

interface WishlistState {
  ids: string[];
  toggle: (swordId: string) => void;
}

/** localStorage를 쓸 수 없으면 메모리에만 담습니다. */
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

export const toValidIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (swordId) =>
        set((state) => ({
          ids: state.ids.includes(swordId) ? state.ids.filter((id) => id !== swordId) : [...state.ids, swordId],
        })),
    }),
    {
      name: SITE.wishlistStorageKey,
      storage: safeStorage,
      skipHydration: true,
      // 저장값이 깨져 있어도 머리글(모든 화면)이 멈추지 않게 문자열 배열만 받습니다.
      merge: (persisted, current) => {
        const ids = (persisted as { ids?: unknown } | undefined)?.ids;
        return { ...current, ids: toValidIds(ids) };
      },
    },
  ),
);

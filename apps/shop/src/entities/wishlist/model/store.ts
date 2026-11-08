'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SITE } from '@/shared/config';
import { safeJsonStorage } from '@/shared/lib/safe-storage';

interface WishlistState {
  ids: string[];
  toggle: (swordId: string) => void;
}

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
      storage: safeJsonStorage,
      skipHydration: true,
      // 저장값이 깨져 있어도 머리글(모든 화면)이 멈추지 않게 문자열 배열만 받습니다.
      merge: (persisted, current) => {
        const ids = (persisted as { ids?: unknown } | undefined)?.ids;
        return { ...current, ids: toValidIds(ids) };
      },
    },
  ),
);

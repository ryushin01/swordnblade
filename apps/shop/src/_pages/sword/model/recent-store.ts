'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { toValidIds } from '@/entities/wishlist';
import { SITE } from '@/shared/config';
import { safeJsonStorage } from '@/shared/lib/safe-storage';

const MAX_RECENT = 9;

interface RecentState {
  ids: string[];
  record: (swordId: string) => void;
}

/** 방금 본 도검을 맨 앞으로 옮깁니다. */
export const pushRecent = (ids: string[], swordId: string, max = MAX_RECENT): string[] =>
  [swordId, ...ids.filter((id) => id !== swordId)].slice(0, max);

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      record: (swordId) => set((state) => ({ ids: pushRecent(state.ids, swordId) })),
    }),
    {
      name: SITE.recentStorageKey,
      storage: safeJsonStorage,
      skipHydration: true,
      merge: (persisted, current) => ({ ...current, ids: toValidIds((persisted as { ids?: unknown })?.ids) }),
    },
  ),
);

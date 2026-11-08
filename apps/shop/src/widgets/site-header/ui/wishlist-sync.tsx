'use client';

import { useEffect, useRef } from 'react';

import { useMe, useSessionHydrated, useSessionStore } from '@/entities/session';
import { useWishlistHydrated, useWishlistStore } from '@/entities/wishlist';
import { apiFetch } from '@/shared/api';

const saveWishlist = (ids: string[]) =>
  apiFetch<string[]>('/api/me/wishlist', { method: 'PUT', body: JSON.stringify(ids) });

/**
 * 로그인하면 이 브라우저의 찜과 계정의 찜을 합치고, 그 뒤로 바뀌는 찜을 계정에 저장합니다.
 * 로그아웃하면 같은 기기의 다음 사람에게 보이지 않게 이 브라우저의 찜을 비웁니다.
 */
export function WishlistSync() {
  const wishlistReady = useWishlistHydrated();
  const sessionReady = useSessionHydrated();
  const token = useSessionStore((state) => state.token);
  const userId = useMe().data?.id ?? null;
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    if (!wishlistReady || !userId || syncedUser.current === userId) return;
    let stale = false;
    void apiFetch<string[]>('/api/me/wishlist')
      .then(async (remote) => {
        if (stale) return;
        const merged = [...new Set([...remote, ...useWishlistStore.getState().ids])];
        useWishlistStore.getState().setIds(merged);
        if (merged.length !== remote.length) await saveWishlist(merged);
        syncedUser.current = userId;
      })
      // 합치지 못했으면 다음에 다시 시도하고, 찜은 이 브라우저에 그대로 둡니다.
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [wishlistReady, userId]);

  useEffect(
    () =>
      useWishlistStore.subscribe((state, previous) => {
        if (syncedUser.current && state.ids !== previous.ids) void saveWishlist(state.ids).catch(() => undefined);
      }),
    [],
  );

  useEffect(() => {
    if (!sessionReady || token || !syncedUser.current) return;
    syncedUser.current = null;
    useWishlistStore.getState().setIds([]);
  }, [sessionReady, token]);

  return null;
}

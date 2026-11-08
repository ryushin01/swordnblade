'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { useWishlistStore } from './store';

const subscribe = (onChange: () => void) => useWishlistStore.persist.onFinishHydration(onChange);
const getSnapshot = () => useWishlistStore.persist.hasHydrated();
// 서버 렌더에서는 저장된 찜 목록을 모르므로 항상 false입니다.
const getServerSnapshot = () => false;

/** 서버 렌더와 어긋나지 않도록, 마운트 뒤에 저장된 찜 목록을 불러옵니다. */
export function useWishlistHydrated(): boolean {
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (!useWishlistStore.persist.hasHydrated()) void useWishlistStore.persist.rehydrate();
  }, []);
  return hydrated;
}

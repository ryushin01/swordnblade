'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { useCartStore } from './store';

const subscribe = (onChange: () => void) => useCartStore.persist.onFinishHydration(onChange);
const getSnapshot = () => useCartStore.persist.hasHydrated();
// 서버 렌더에서는 저장된 장바구니를 모르므로 항상 false입니다.
const getServerSnapshot = () => false;

/** 서버 렌더와 어긋나지 않도록, 마운트 뒤에 저장된 장바구니를 불러옵니다. */
export function useCartHydrated(): boolean {
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (!useCartStore.persist.hasHydrated()) void useCartStore.persist.rehydrate();
  }, []);
  return hydrated;
}

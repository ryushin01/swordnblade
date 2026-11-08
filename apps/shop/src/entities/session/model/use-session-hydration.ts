'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { useSessionStore } from './store';

const subscribe = (onChange: () => void) => useSessionStore.persist.onFinishHydration(onChange);
const getSnapshot = () => useSessionStore.persist.hasHydrated();
// 서버 렌더에서는 로그인 여부를 모르므로 항상 false입니다.
const getServerSnapshot = () => false;

/** 서버 렌더와 어긋나지 않도록, 마운트 뒤에 저장된 로그인 토큰을 불러옵니다. */
export function useSessionHydrated(): boolean {
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (!useSessionStore.persist.hasHydrated()) void useSessionStore.persist.rehydrate();
  }, []);
  return hydrated;
}

'use client';

import { useEffect, useSyncExternalStore } from 'react';

interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
    rehydrate: () => Promise<void> | void;
  };
}

/**
 * skipHydration으로 만든 persist 저장소를 마운트 뒤에 불러옵니다.
 * 서버 렌더에서는 저장값을 모르므로 항상 false여서 화면이 어긋나지 않습니다.
 */
export function useStoreHydrated(store: PersistedStore): boolean {
  const hydrated = useSyncExternalStore(store.persist.onFinishHydration, store.persist.hasHydrated, () => false);
  useEffect(() => {
    if (!store.persist.hasHydrated()) void store.persist.rehydrate();
  }, [store]);
  return hydrated;
}

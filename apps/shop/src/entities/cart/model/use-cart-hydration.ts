'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from './store';

/** 서버 렌더와 어긋나지 않도록, 마운트 뒤에 저장된 장바구니를 불러옵니다. */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useCartStore.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    if (!useCartStore.persist.hasHydrated()) void useCartStore.persist.rehydrate();
    else setHydrated(true);
    return unsubscribe;
  }, []);
  return hydrated;
}

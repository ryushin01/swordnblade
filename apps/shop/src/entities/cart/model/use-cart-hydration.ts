'use client';

import { useStoreHydrated } from '@/shared/lib/use-store-hydrated';

import { useCartStore } from './store';

/** 서버 렌더와 어긋나지 않도록, 마운트 뒤에 저장된 장바구니를 불러옵니다. */
export const useCartHydrated = (): boolean => useStoreHydrated(useCartStore);

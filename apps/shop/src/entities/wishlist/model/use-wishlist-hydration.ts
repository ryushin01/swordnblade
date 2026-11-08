'use client';

import { useStoreHydrated } from '@/shared/lib/use-store-hydrated';

import { useWishlistStore } from './store';

/** 서버 렌더와 어긋나지 않도록, 마운트 뒤에 저장된 찜 목록을 불러옵니다. */
export const useWishlistHydrated = (): boolean => useStoreHydrated(useWishlistStore);

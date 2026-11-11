'use client';

import { useStoreHydrated } from '@/shared/lib/use-store-hydrated';

import { useSessionStore } from './store';

/** 서버 렌더와 어긋나지 않도록, 마운트 뒤에 저장된 로그인 토큰을 불러옵니다. */
export const useSessionHydrated = (): boolean => useStoreHydrated(useSessionStore);

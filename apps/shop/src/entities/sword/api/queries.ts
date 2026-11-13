'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/shared/api';

import type { Sword, SwordCategory } from '@snb/domain';

const swordKeys = {
  all: ['swords'] as const,
  list: (category?: SwordCategory) => ['swords', 'list', category ?? 'all'] as const,
  detail: (slug: string) => ['swords', 'detail', slug] as const,
};

/**
 * 서버가 시드로 먼저 그린 값(initialData)을 바로 보여 주고, 마운트하자마자 Mock API에서 다시 받아 바꿉니다.
 * 어드민에서 바꾼 가격·재고는 브라우저에만 있으므로 initialDataUpdatedAt을 0으로 두어 항상 새로 받습니다.
 */
const fromServer = <T>(initialData: T | undefined) =>
  initialData === undefined ? {} : { initialData, initialDataUpdatedAt: 0 };

export function useSwords(category?: SwordCategory, initialData?: Sword[]) {
  return useQuery({
    queryKey: swordKeys.list(category),
    queryFn: () => apiFetch<Sword[]>(category ? `/api/swords?category=${category}` : '/api/swords'),
    ...fromServer(initialData),
  });
}

export function useSword(slug: string, initialData?: Sword) {
  return useQuery({
    queryKey: swordKeys.detail(slug),
    queryFn: () => apiFetch<Sword>(`/api/swords/${encodeURIComponent(slug)}`),
    ...fromServer(initialData),
  });
}

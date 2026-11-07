'use client';

import { useQuery } from '@tanstack/react-query';
import type { Sword, SwordCategory } from '@snb/domain';
import { apiFetch } from '@/shared/api';

export const swordKeys = {
  all: ['swords'] as const,
  list: (category?: SwordCategory) => ['swords', 'list', category ?? 'all'] as const,
  detail: (slug: string) => ['swords', 'detail', slug] as const,
};

export function useSwords(category?: SwordCategory) {
  return useQuery({
    queryKey: swordKeys.list(category),
    queryFn: () => apiFetch<Sword[]>(category ? `/api/swords?category=${category}` : '/api/swords'),
  });
}

export function useSword(slug: string) {
  return useQuery({
    queryKey: swordKeys.detail(slug),
    queryFn: () => apiFetch<Sword>(`/api/swords/${encodeURIComponent(slug)}`),
  });
}

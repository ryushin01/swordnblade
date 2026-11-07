'use client';

import { useQuery } from '@tanstack/react-query';
import type { Sword } from '@snb/domain';
import { apiFetch, useSaveMutation } from '@/shared/api';

export const swordKeys = { all: ['swords'] as const, detail: (id: string) => ['swords', id] as const };

export const useSwords = () => useQuery({ queryKey: swordKeys.all, queryFn: () => apiFetch<Sword[]>('/api/swords') });

export const useSword = (id: string) =>
  useQuery({ queryKey: swordKeys.detail(id), queryFn: () => apiFetch<Sword>(`/api/swords/${encodeURIComponent(id)}`) });

export type SwordInput = Omit<Sword, 'id'> & { id?: string };

export function useSaveSword(onSuccess?: (sword: Sword) => void) {
  return useSaveMutation<SwordInput, Sword>({
    mutationFn: (data) =>
      data.id
        ? apiFetch<Sword>(`/api/swords/${data.id}`, { method: 'PUT', body: JSON.stringify(data) })
        : apiFetch<Sword>('/api/swords', { method: 'POST', body: JSON.stringify(data) }),
    invalidate: [swordKeys.all, ['stats']],
    successMessage: '상품을 저장했습니다.',
    onSuccess,
  });
}

export function useDeleteSword() {
  return useSaveMutation<string, void>({
    mutationFn: (id) => apiFetch<void>(`/api/swords/${id}`, { method: 'DELETE' }),
    invalidate: [swordKeys.all, ['stats']],
    successMessage: '상품을 삭제했습니다.',
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetch, useSaveMutation } from '@/shared/api';

import type { CustomsConfig } from '@snb/domain';

export const useCustomsConfig = () =>
  useQuery({ queryKey: ['customs-config'], queryFn: () => apiFetch<CustomsConfig>('/api/customs-config') });

export function useSaveCustomsConfig() {
  return useSaveMutation<CustomsConfig, CustomsConfig>({
    mutationFn: (data) => apiFetch<CustomsConfig>('/api/customs-config', { method: 'PUT', body: JSON.stringify(data) }),
    invalidate: [['customs-config']],
    successMessage: '관세·환율 설정을 저장했습니다.',
  });
}

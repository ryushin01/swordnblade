'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/shared/api';

import type { CustomsConfig } from '@snb/domain';

export function useCustomsConfig() {
  return useQuery({
    queryKey: ['customs-config'],
    queryFn: () => apiFetch<CustomsConfig>('/api/customs-config'),
    staleTime: 5 * 60 * 1000,
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import type { CustomsConfig } from '@snb/domain';
import { apiFetch } from '@/shared/api';

export function useCustomsConfig() {
  return useQuery({
    queryKey: ['customs-config'],
    queryFn: () => apiFetch<CustomsConfig>('/api/customs-config'),
    staleTime: 5 * 60 * 1000,
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardStats } from '@snb/mocks';
import { apiFetch } from '@/shared/api';

export const useStats = () => useQuery({ queryKey: ['stats'], queryFn: () => apiFetch<DashboardStats>('/api/stats') });

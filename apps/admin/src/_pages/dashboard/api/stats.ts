'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/shared/api';

import type { DashboardStats } from '@snb/mocks';

export const useStats = () => useQuery({ queryKey: ['stats'], queryFn: () => apiFetch<DashboardStats>('/api/stats') });

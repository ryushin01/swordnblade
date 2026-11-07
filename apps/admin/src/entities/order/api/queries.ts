'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetch, useSaveMutation } from '@/shared/api';

import type { Order, OrderStatus } from '@snb/domain';

export const useOrders = () => useQuery({ queryKey: ['orders'], queryFn: () => apiFetch<Order[]>('/api/orders') });

export function useUpdateOrderStatus() {
  return useSaveMutation<{ id: string; status: OrderStatus }, Order>({
    mutationFn: ({ id, status }) =>
      apiFetch<Order>(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    invalidate: [['orders'], ['stats']],
    successMessage: '주문 상태를 바꿨습니다.',
  });
}

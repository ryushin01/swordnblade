'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Order } from '@snb/domain';
import type { CreateOrderBody } from '@snb/mocks';
import { apiFetch } from '@/shared/api';

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiFetch<Order>(`/api/orders/${encodeURIComponent(id)}`),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderBody) => apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (order) => {
      queryClient.setQueryData(['orders', order.id], order);
      // 재고가 바뀌었으므로 상품 목록을 새로 받습니다.
      void queryClient.invalidateQueries({ queryKey: ['swords'] });
    },
  });
}

export type { CreateOrderBody };

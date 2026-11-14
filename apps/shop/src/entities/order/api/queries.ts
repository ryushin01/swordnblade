'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch, ApiRequestError } from '@/shared/api';

import type { Order } from '@snb/domain';
import type { CreateOrderBody } from '@snb/mocks';

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiFetch<Order>(`/api/orders/${encodeURIComponent(id)}`),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderBody) =>
      apiFetch<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (order) => {
      queryClient.setQueryData(['orders', order.id], order);
      // 재고가 바뀌었으므로 상품 목록을 새로 받습니다.
      void queryClient.invalidateQueries({ queryKey: ['swords'] });
    },
    onError: (error) => {
      // 주문하는 사이 금액이 바뀌었으면 가격과 관세율을 새로 받아 주문서에 바뀐 금액을 보여 줍니다.
      if (error instanceof ApiRequestError && error.code === 'price-changed') {
        void queryClient.invalidateQueries({ queryKey: ['swords'] });
        void queryClient.invalidateQueries({ queryKey: ['customs-config'] });
      }
    },
  });
}

export type { CreateOrderBody };

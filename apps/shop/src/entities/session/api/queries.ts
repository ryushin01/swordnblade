'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch, ApiRequestError } from '@/shared/api';

import { useSessionStore } from '../model/store';
import { useSessionHydrated } from '../model/use-session-hydration';

import type { Order, User } from '@snb/domain';
import type { AuthResponse, LoginBody, SignupBody } from '@snb/mocks';

export const sessionKeys = {
  me: (token: string | null) => ['session', 'me', token] as const,
  orders: (token: string | null) => ['session', 'orders', token] as const,
};

/** 로그인한 회원. 토큰이 없으면 요청하지 않고 null입니다. */
export function useMe() {
  useSessionHydrated();
  const token = useSessionStore((state) => state.token);
  const setToken = useSessionStore((state) => state.setToken);
  return useQuery({
    queryKey: sessionKeys.me(token),
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      try {
        return await apiFetch<User>('/api/auth/me');
      } catch (error) {
        // 세션이 만료됐을 때(401)만 토큰을 지웁니다. 페이지를 떠나며 끊긴 요청이나 네트워크 오류로는 로그아웃하지 않습니다.
        if (error instanceof ApiRequestError && error.status === 401) setToken(null);
        throw error;
      }
    },
  });
}

export function useMyOrders() {
  const token = useSessionStore((state) => state.token);
  return useQuery({
    queryKey: sessionKeys.orders(token),
    enabled: Boolean(token),
    queryFn: () => apiFetch<Order[]>('/api/me/orders'),
  });
}

/** 내 주문 취소. 재고와 주문 상세도 함께 새로 받습니다. */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Order>(`/api/me/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['session'] });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['swords'] });
    },
  });
}

function useStartSession<TBody>(path: string) {
  const setToken = useSessionStore((state) => state.setToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TBody) => apiFetch<AuthResponse>(path, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(sessionKeys.me(token), user);
    },
  });
}

export const useLogin = () => useStartSession<LoginBody>('/api/auth/login');
export const useSignup = () => useStartSession<SignupBody>('/api/auth/signup');

export function useLogout() {
  const setToken = useSessionStore((state) => state.setToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>('/api/auth/logout', { method: 'POST' }),
    onSettled: () => {
      setToken(null);
      queryClient.removeQueries({ queryKey: ['session'] });
    },
  });
}

'use client';

import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';

import { ApiRequestError } from './client';

/**
 * 저장 요청 공통 훅. 보낼 데이터를 mutate(data)로 직접 넘기고,
 * 끝나면 관련 쿼리를 새로 받아 오며 결과를 메시지로 알립니다.
 */
export function useSaveMutation<TData, TResult>(options: {
  mutationFn: (data: TData) => Promise<TResult>;
  invalidate: QueryKey[];
  successMessage: string;
  onSuccess?: (result: TResult) => void;
}) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: async (result) => {
      // 저장은 끝났으므로 결과를 먼저 알립니다. 목록 새로 받기는 그 뒤에 기다려,
      // 새 값이 올 때까지 isPending을 유지해 옛 값이 잠깐 다시 보이지 않게 합니다.
      void message.success(options.successMessage);
      await Promise.all(options.invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      options.onSuccess?.(result);
    },
    onError: (error) => {
      void message.error(error instanceof ApiRequestError ? error.message : '저장하지 못했습니다. 다시 시도해 주세요.');
    },
  });
}

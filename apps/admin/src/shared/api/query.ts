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
      await Promise.all(options.invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      void message.success(options.successMessage);
      options.onSuccess?.(result);
    },
    onError: (error) => {
      void message.error(error instanceof ApiRequestError ? error.message : '저장하지 못했습니다. 다시 시도해 주세요.');
    },
  });
}

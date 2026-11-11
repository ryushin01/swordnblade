'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/shared/api';

import type { Review } from '@snb/domain';

const reviewKey = (slug: string) => ['reviews', slug] as const;

export const useReviews = (slug: string) =>
  useQuery({
    queryKey: reviewKey(slug),
    queryFn: () => apiFetch<Review[]>(`/api/swords/${encodeURIComponent(slug)}/reviews`),
  });

export function useCreateReview(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { rating: number; text: string }) =>
      apiFetch<Review>(`/api/swords/${encodeURIComponent(slug)}/reviews`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKey(slug) }),
  });
}

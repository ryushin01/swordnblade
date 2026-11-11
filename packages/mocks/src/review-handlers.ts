import { http, HttpResponse } from 'msw';

import { findSessionUser } from './auth-handlers';

import type { Db, StoredReview } from './db';
import type { Review } from '@snb/domain';

/** 공개되는 이름은 가립니다. 김가상 → 김*상, 김가 → 김* */
export function maskName(name: string): string {
  const chars = [...name.trim()];
  if (chars.length <= 1) return chars.join('');
  if (chars.length === 2) return `${chars[0]}*`;
  return `${chars[0]}${'*'.repeat(chars.length - 2)}${chars.at(-1)}`;
}

export function createReviewHandlers(db: Db, wait: () => Promise<unknown>) {
  const fail = (status: number, message: string, fields?: Record<string, string>) =>
    HttpResponse.json({ message, fields }, { status });
  const findSword = (key: string) => db.read().swords.find((sword) => sword.slug === key || sword.id === key);
  const toPublic = (review: StoredReview): Review => {
    const user = db.read().users?.find((item) => item.id === review.userId);
    return {
      ...review,
      authorName: maskName(user?.name ?? '탈퇴한 회원'),
      ...(user?.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    };
  };

  return [
    http.get<{ slug: string }>('*/api/swords/:slug/reviews', async ({ params }) => {
      await wait();
      const sword = findSword(params.slug);
      if (!sword) return fail(404, '상품을 찾을 수 없습니다.');
      const reviews = (db.read().reviews ?? [])
        .filter((review) => review.swordId === sword.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return HttpResponse.json(reviews.map(toPublic));
    }),

    http.post<{ slug: string }>('*/api/swords/:slug/reviews', async ({ params, request }) => {
      await wait();
      const user = findSessionUser(db, request);
      if (!user) return fail(401, '로그인이 필요합니다.');
      const sword = findSword(params.slug);
      if (!sword) return fail(404, '상품을 찾을 수 없습니다.');
      const state = db.read();
      const purchased = state.orders.some(
        (order) =>
          order.userId === user.id &&
          order.status !== 'cancelled' &&
          order.lines.some((line) => line.swordId === sword.id),
      );
      if (!purchased) return fail(403, '구매한 회원만 후기를 쓸 수 있습니다.');
      if (state.reviews?.some((review) => review.swordId === sword.id && review.userId === user.id)) {
        return fail(409, '이미 후기를 썼습니다.');
      }
      const body = (await request.json().catch(() => null)) as { rating?: unknown; text?: unknown } | null;
      const rating = Number(body?.rating);
      const text = typeof body?.text === 'string' ? body.text.trim() : '';
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || text.length < 1 || text.length > 500) {
        return fail(422, '별점과 후기 내용을 확인해 주세요.');
      }
      const review: StoredReview = {
        id: crypto.randomUUID(),
        swordId: sword.id,
        userId: user.id,
        rating,
        text,
        createdAt: new Date().toISOString(),
      };
      db.write((current) => ({ ...current, reviews: [...(current.reviews ?? []), review] }));
      return HttpResponse.json(toPublic(review), { status: 201 });
    }),
  ];
}

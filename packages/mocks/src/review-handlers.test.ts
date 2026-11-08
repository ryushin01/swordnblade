import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createMockServer } from './node';
import { maskName } from './review-handlers';

import type { AuthResponse } from './auth-handlers';

const { server, db } = createMockServer();
const BASE = 'http://localhost';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => db.reset());
afterAll(() => server.close());

const signup = async (email: string) =>
  (await (
    await fetch(`${BASE}/api/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ name: '김가상', email, password: 'sword1234' }),
    })
  ).json()) as AuthResponse;
const post = (token: string, body: unknown, slug = 'ssangsudo') =>
  fetch(`${BASE}/api/swords/${slug}/reviews`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
const buy = (userId: string, status: 'paid' | 'cancelled' = 'paid') =>
  db.write((state) => ({
    ...state,
    orders: [
      {
        ...state.orders[0]!,
        id: 'SNB-R',
        userId,
        status,
        lines: [{ swordId: 'sw-001', name: '쌍수도', origin: 'KR', unitPrice: 1, quantity: 1 }],
      },
      ...state.orders,
    ],
  }));

describe('후기 Mock API', () => {
  it('이름을 가린다', () => {
    expect(maskName('김가상')).toBe('김*상');
    expect(maskName('김가')).toBe('김*');
    expect(maskName('남궁가상')).toBe('남**상');
  });

  it('산 회원만 쓰고, 이름은 가려서 프로필 사진과 함께 나간다', async () => {
    const { token, user } = await signup('a@example.com');
    expect((await post(token, { rating: 5, text: '좋아요' })).status).toBe(403);
    buy(user.id);
    db.write((state) => ({
      ...state,
      users: state.users?.map((item) => ({ ...item, avatarUrl: '/api/images/a' })),
    }));
    expect((await post(token, { rating: 5, text: '좋아요' })).status).toBe(201);
    expect((await post(token, { rating: 4, text: '또' })).status).toBe(409);
    const [review] = (await (await fetch(`${BASE}/api/swords/ssangsudo/reviews`)).json()) as Array<
      Record<string, unknown>
    >;
    expect(review).toMatchObject({ authorName: '김*상', avatarUrl: '/api/images/a', rating: 5 });
  });

  it('취소한 주문으로는 쓰지 못하고, 잘못된 별점은 거절한다', async () => {
    const { token, user } = await signup('b@example.com');
    buy(user.id, 'cancelled');
    expect((await post(token, { rating: 5, text: '좋아요' })).status).toBe(403);
    db.write((state) => ({
      ...state,
      orders: state.orders.map((order) => (order.id === 'SNB-R' ? { ...order, status: 'paid' } : order)),
    }));
    expect((await post(token, { rating: 9, text: '좋아요' })).status).toBe(422);
    expect((await post(token, { rating: 3, text: '   ' })).status).toBe(422);
  });

  it('프로필 사진은 Mock 이미지 주소만 받는다', async () => {
    const { token } = await signup('c@example.com');
    const put = (avatarUrl: unknown) =>
      fetch(`${BASE}/api/me/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl }),
      });
    expect((await put('https://evil.example/a.png')).status).toBe(400);
    expect(await (await put('/api/images/x')).json()).toMatchObject({ avatarUrl: '/api/images/x' });
    expect(await (await put(null)).json()).not.toHaveProperty('avatarUrl');
  });
});

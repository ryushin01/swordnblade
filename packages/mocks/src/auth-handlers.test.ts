import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createMockServer } from './node';

import type { AuthResponse } from './auth-handlers';
import type { Order, User } from '@snb/domain';

const { server, db } = createMockServer();
const BASE = 'http://localhost';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => db.reset());
afterAll(() => server.close());

const post = (path: string, body: unknown, token?: string) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

const signup = () => post('/api/auth/signup', { name: '홍길동', email: 'Hong@Example.com', password: 'blade2026' });

describe('회원 Mock API', () => {
  it('가입하면 세션 토큰을 받고, 비밀번호는 해시로만 저장한다', async () => {
    const response = await signup();
    expect(response.status).toBe(201);
    const { token, user } = (await response.json()) as AuthResponse;
    expect(token).toBeTruthy();
    expect(user).toMatchObject({ name: '홍길동', email: 'hong@example.com' });
    expect(user).not.toHaveProperty('passwordHash');
    const stored = db.read().users?.[0];
    expect(stored?.passwordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(db.read())).not.toContain('blade2026');
  });

  it('같은 이메일은 다시 가입할 수 없고, 약한 비밀번호는 거절한다', async () => {
    await signup();
    expect((await signup()).status).toBe(409);
    const weak = await post('/api/auth/signup', { name: '김', email: 'kim@example.com', password: 'short' });
    expect(weak.status).toBe(422);
    expect(((await weak.json()) as { fields: Record<string, string> }).fields.password).toBeDefined();
  });

  it('로그인·내 정보·로그아웃', async () => {
    await signup();
    const wrong = await post('/api/auth/login', { email: 'hong@example.com', password: 'wrong-pass1' });
    expect(wrong.status).toBe(401);

    const { token } = (await (
      await post('/api/auth/login', { email: 'HONG@example.com', password: 'blade2026' })
    ).json()) as AuthResponse;
    const me = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    expect(((await me.json()) as User).name).toBe('홍길동');

    await post('/api/auth/logout', {}, token);
    expect((await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).status).toBe(401);
  });

  it('로그인한 채 주문하면 내 주문 내역에 보인다', async () => {
    const { token } = (await (await signup()).json()) as AuthResponse;
    const customer = {
      name: '홍길동',
      email: 'hong@example.com',
      phone: '010-0000-0000',
      postalCode: '03000',
      address: '서울',
    };
    await post(
      '/api/orders',
      {
        destination: 'KR',
        customer,
        lines: [{ swordId: 'sw-010', quantity: 1 }],
        paymentMethod: 'card',
        permitConfirmed: true,
      },
      token,
    );
    const mine = (await (
      await fetch(`${BASE}/api/me/orders`, { headers: { Authorization: `Bearer ${token}` } })
    ).json()) as Order[];
    expect(mine).toHaveLength(1);
    expect(mine[0]?.lines[0]?.swordId).toBe('sw-010');
    expect((await fetch(`${BASE}/api/me/orders`)).status).toBe(401);
  });

  it('어드민 회원 목록은 주문 수를 주고 비밀번호 해시는 주지 않는다', async () => {
    db.write((state) => ({
      ...state,
      users: [
        {
          id: 'u-9',
          email: 'a@example.com',
          name: '가상',
          createdAt: '2026-11-08T00:00:00.000Z',
          passwordHash: 'secret',
        },
      ],
      orders: state.orders.map((order, index) => (index === 0 ? { ...order, userId: 'u-9' } : order)),
    }));
    const list = (await (await fetch('http://localhost/api/users')).json()) as Array<Record<string, unknown>>;
    expect(list).toEqual([expect.objectContaining({ id: 'u-9', orderCount: 1 })]);
    expect(list[0]).not.toHaveProperty('passwordHash');
  });

  const signupToken = async (email: string) => {
    const response = await fetch(`${BASE}/api/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ name: '가상', email, password: 'sword1234' }),
    });
    return ((await response.json()) as AuthResponse).token;
  };
  const authed = (token: string) => ({ Authorization: `Bearer ${token}` });
  const placeOrder = (userId: string, status: Order['status'] = 'paid') => {
    const first = db.read().swords[0]!;
    db.write((state) => ({
      ...state,
      swords: state.swords.map((sword) => (sword.id === first.id ? { ...sword, stock: 1 } : sword)),
      orders: [
        {
          ...state.orders[0]!,
          id: 'SNB-TEST',
          userId,
          status,
          lines: [{ swordId: first.id, name: first.name, origin: first.origin, unitPrice: first.price, quantity: 2 }],
        },
        ...state.orders,
      ],
    }));
    return first.id;
  };

  it('회원이 출고 전 주문을 취소하면 재고가 돌아온다', async () => {
    const token = await signupToken('cancel@example.com');
    const swordId = placeOrder(db.read().users!.at(-1)!.id);
    const response = await fetch(`${BASE}/api/me/orders/SNB-TEST/cancel`, { method: 'POST', headers: authed(token) });
    expect(response.status).toBe(200);
    expect(db.read().swords.find((s) => s.id === swordId)?.stock).toBe(3);
    expect(db.read().orders.find((o) => o.id === 'SNB-TEST')?.status).toBe('cancelled');
  });

  it('출고한 주문과 다른 회원의 주문은 취소하지 못한다', async () => {
    const token = await signupToken('owner@example.com');
    placeOrder(db.read().users!.at(-1)!.id, 'shipped');
    const url = `${BASE}/api/me/orders/SNB-TEST/cancel`;
    expect((await fetch(url, { method: 'POST', headers: authed(token) })).status).toBe(409);
    const other = await signupToken('other@example.com');
    expect((await fetch(url, { method: 'POST', headers: authed(other) })).status).toBe(404);
  });

  it('찜 목록을 계정에 저장한다', async () => {
    const token = await signupToken('wish@example.com');
    const put = await fetch(`${BASE}/api/me/wishlist`, {
      method: 'PUT',
      headers: authed(token),
      body: JSON.stringify(['sw-001', 'sw-001', 'sw-002']),
    });
    expect(await put.json()).toEqual(['sw-001', 'sw-002']);
    expect(await (await fetch(`${BASE}/api/me/wishlist`, { headers: authed(token) })).json()).toEqual([
      'sw-001',
      'sw-002',
    ]);
    expect((await fetch(`${BASE}/api/me/wishlist`)).status).toBe(401);
  });
});

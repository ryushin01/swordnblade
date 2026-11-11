import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ADMIN_DEMO_ACCOUNT } from './admin-handlers';
import { createDb } from './db';
import { createHandlers } from './handlers';

const BASE = 'http://localhost';
const server = setupServer(...createHandlers(createDb(), { requireAdmin: true }));

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterAll(() => server.close());

describe('어드민 권한', () => {
  it('로그인하지 않으면 어드민 API를 막고, 쇼핑몰 공개 API는 그대로 둔다', async () => {
    expect((await fetch(`${BASE}/api/users`)).status).toBe(401);
    expect((await fetch(`${BASE}/api/orders`)).status).toBe(401);
    expect((await fetch(`${BASE}/api/stats`)).status).toBe(401);
    expect((await fetch(`${BASE}/api/swords`)).status).toBe(200);
  });

  it('데모 계정으로 로그인하면 쓸 수 있고, 틀리면 401이다', async () => {
    const login = (password: string) =>
      fetch(`${BASE}/api/admin/login`, { method: 'POST', body: JSON.stringify({ ...ADMIN_DEMO_ACCOUNT, password }) });
    expect((await login('nope')).status).toBe(401);
    const { token } = (await (await login(ADMIN_DEMO_ACCOUNT.password)).json()) as { token: string };
    const response = await fetch(`${BASE}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
    expect(response.status).toBe(200);
  });
});

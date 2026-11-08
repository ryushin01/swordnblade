import { http, HttpResponse } from 'msw';

import { EMAIL_RULE, PASSWORD_RULE, type User } from '@snb/domain';

import type { Db, Session, StoredUser } from './db';

export interface SignupBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Mock이라도 비밀번호를 평문으로 두지 않고 이메일을 소금으로 SHA-256 해시를 남깁니다. */
export async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** 응답에는 비밀번호 해시를 넣지 않습니다. */
/** 어드민 회원 목록의 한 줄 */
export interface AdminUser extends User {
  orderCount: number;
}

const publicUser = (user: StoredUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});

/** Authorization: Bearer <token>에서 로그인한 회원을 찾습니다. */
export function findSessionUser(db: Db, request: Request): StoredUser | undefined {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return undefined;
  const state = db.read();
  const session = state.sessions?.find((item) => item.token === token);
  return session ? state.users?.find((user) => user.id === session.userId) : undefined;
}

export function createAuthHandlers(db: Db, wait: () => Promise<unknown> = () => Promise.resolve()) {
  const unauthorized = () => HttpResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });

  const startSession = (user: StoredUser): AuthResponse => {
    const session: Session = { token: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
    db.write((state) => ({ ...state, sessions: [...(state.sessions ?? []), session] }));
    return { token: session.token, user: publicUser(user) };
  };

  return [
    // 어드민 회원 목록. 비밀번호 해시는 내보내지 않습니다.
    // Mock에는 어드민 계정이 없어(/api/orders와 같이) 권한을 검사하지 않습니다. 실제 서비스라면 서버에서 어드민 권한을 확인해야 합니다.
    http.get('*/api/users', async () => {
      await wait();
      const { users = [], orders } = db.read();
      const list: AdminUser[] = users.map((user) => ({
        ...publicUser(user),
        orderCount: orders.filter((order) => order.userId === user.id).length,
      }));
      return HttpResponse.json(list);
    }),

    http.post('*/api/auth/signup', async ({ request }) => {
      await wait();
      const body = (await request.json().catch(() => ({}))) as Partial<SignupBody>;
      const name = body.name?.trim() ?? '';
      const email = body.email?.trim().toLowerCase() ?? '';
      const fields: Record<string, string> = {};
      if (!name) fields.name = 'name';
      if (!EMAIL_RULE.test(email)) fields.email = 'email';
      if (!PASSWORD_RULE.test(body.password ?? '')) fields.password = 'password';
      if (Object.keys(fields).length > 0) {
        return HttpResponse.json({ message: '입력 내용을 확인해 주세요.', fields }, { status: 422 });
      }
      if (db.read().users?.some((user) => user.email === email)) {
        return HttpResponse.json({ message: '이미 가입한 이메일입니다.', fields: { email: 'taken' } }, { status: 409 });
      }
      const user: StoredUser = {
        id: `u-${crypto.randomUUID()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
        passwordHash: await hashPassword(email, body.password!),
      };
      db.write((state) => ({ ...state, users: [...(state.users ?? []), user] }));
      return HttpResponse.json(startSession(user), { status: 201 });
    }),

    http.post('*/api/auth/login', async ({ request }) => {
      await wait();
      const body = (await request.json().catch(() => ({}))) as Partial<LoginBody>;
      const email = body.email?.trim().toLowerCase() ?? '';
      const user = db.read().users?.find((item) => item.email === email);
      // 이메일이 있는지 알려 주지 않도록 같은 안내를 씁니다.
      if (!user || user.passwordHash !== (await hashPassword(email, body.password ?? ''))) {
        return HttpResponse.json({ message: '이메일 또는 비밀번호가 맞지 않습니다.' }, { status: 401 });
      }
      return HttpResponse.json(startSession(user));
    }),

    http.post('*/api/auth/logout', async ({ request }) => {
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
      db.write((state) => ({ ...state, sessions: (state.sessions ?? []).filter((item) => item.token !== token) }));
      return new HttpResponse(null, { status: 204 });
    }),

    http.get('*/api/auth/me', async ({ request }) => {
      await wait();
      const user = findSessionUser(db, request);
      return user ? HttpResponse.json(publicUser(user)) : unauthorized();
    }),

    http.get('*/api/me/orders', async ({ request }) => {
      await wait();
      const user = findSessionUser(db, request);
      if (!user) return unauthorized();
      const orders = db
        .read()
        .orders.filter((order) => order.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return HttpResponse.json(orders);
    }),
  ];
}

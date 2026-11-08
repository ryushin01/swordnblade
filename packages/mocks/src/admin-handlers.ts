import { http, HttpResponse } from 'msw';

import type { Db } from './db';

/** 어드민 데모 계정. 로그인 화면에 공개하는 값이며 실제 비밀이 아닙니다. */
export const ADMIN_DEMO_ACCOUNT = { email: 'admin@example.com', password: 'demo1234' };

export function isAdmin(db: Db, request: Request): boolean {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(token && db.read().adminSessions?.includes(token));
}

export function createAdminHandlers(db: Db, wait: () => Promise<unknown>) {
  return [
    http.post('*/api/admin/login', async ({ request }) => {
      await wait();
      const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
      if (body?.email !== ADMIN_DEMO_ACCOUNT.email || body.password !== ADMIN_DEMO_ACCOUNT.password) {
        return HttpResponse.json({ message: '이메일 또는 비밀번호가 맞지 않습니다.' }, { status: 401 });
      }
      const token = crypto.randomUUID();
      db.write((state) => ({ ...state, adminSessions: [...(state.adminSessions ?? []), token] }));
      return HttpResponse.json({ token });
    }),

    http.post('*/api/admin/logout', async ({ request }) => {
      await wait();
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
      db.write((state) => ({ ...state, adminSessions: state.adminSessions?.filter((item) => item !== token) }));
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

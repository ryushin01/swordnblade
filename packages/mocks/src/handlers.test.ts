import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createMockServer } from './node';

import type { Order } from '@snb/domain';

const { server, db } = createMockServer();
const BASE = 'http://localhost';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => db.reset());
afterAll(() => server.close());

const customer = {
  name: '홍길동',
  email: 'test@example.com',
  phone: '010-1234-5678',
  postalCode: '04524',
  address: '서울 중구 세종대로 110',
};

describe('Mock API', () => {
  it('카테고리로 상품을 거른다', async () => {
    const swords = (await (await fetch(`${BASE}/api/swords?category=legend`)).json()) as Array<{ category: string }>;
    expect(swords.length).toBeGreaterThan(0);
    expect(swords.every((sword) => sword.category === 'legend')).toBe(true);
  });

  it('주문 금액은 서버가 관세까지 다시 계산하고 재고를 줄인다', async () => {
    const response = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      body: JSON.stringify({
        destination: 'KR',
        customer,
        lines: [{ swordId: 'sw-004', quantity: 1 }],
        paymentMethod: 'card',
        permitConfirmed: true,
      }),
    });
    expect(response.status).toBe(201);
    const order = (await response.json()) as Order;
    expect(order.amounts).toEqual({
      goods: 4_500_000,
      shipping: 85_000,
      duty: 366_800,
      vat: 495_180,
      total: 5_446_980,
    });
    expect(order.status).toBe('permit-review');
    expect(db.read().swords.find((sword) => sword.id === 'sw-004')?.stock).toBe(3);
  });

  it('진검 주문에서 허가 확인을 안 하면 422', async () => {
    const response = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      body: JSON.stringify({
        destination: 'KR',
        customer,
        lines: [{ swordId: 'sw-001', quantity: 1 }],
        paymentMethod: 'card',
        permitConfirmed: false,
      }),
    });
    expect(response.status).toBe(422);
    const body = (await response.json()) as { fields: Record<string, string> };
    expect(body.fields.permitConfirmed).toBeDefined();
  });

  it('재고보다 많이 주문하면 409', async () => {
    const response = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      body: JSON.stringify({
        destination: 'KR',
        customer,
        lines: [{ swordId: 'sw-016', quantity: 5 }],
        paymentMethod: 'card',
        permitConfirmed: true,
      }),
    });
    expect(response.status).toBe(409);
  });

  it('주문 상태를 바꾼다', async () => {
    const response = await fetch(`${BASE}/api/orders/SNB-20261103-0002`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'shipped' }),
    });
    expect(((await response.json()) as Order).status).toBe('shipped');
  });
});

describe('상품 사진 Mock API', () => {
  it('어드민이 주문을 취소하면 재고가 돌아오고, 되살리면 다시 빠진다', async () => {
    const order = db.read().orders[0]!;
    const line = order.lines[0]!;
    const before = db.read().swords.find((s) => s.id === line.swordId)!.stock;
    const patch = (status: string) =>
      fetch(`${BASE}/api/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    const stock = () => db.read().swords.find((s) => s.id === line.swordId)!.stock;

    await patch('cancelled');
    expect(stock()).toBe(before + line.quantity);
    await patch('cancelled');
    expect(stock()).toBe(before + line.quantity);
    await patch('paid');
    expect(stock()).toBe(before);
  });

  it('재고가 모자라면 취소한 주문을 되살리지 못한다', async () => {
    const order = db.read().orders[0]!;
    await fetch(`${BASE}/api/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) });
    db.write((state) => ({ ...state, swords: state.swords.map((s) => ({ ...s, stock: 0 })) }));
    const response = await fetch(`${BASE}/api/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paid' }),
    });
    expect(response.status).toBe(409);
  });

  it('사진을 올리면 주소를 돌려주고, 그 주소로 같은 바이트를 받는다', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: 'image/png' }), 'a.png');
    const response = await fetch(`${BASE}/api/images`, { method: 'POST', body: form });
    expect(response.status).toBe(201);
    const { url } = (await response.json()) as { url: string };
    expect(url).toMatch(/^\/api\/images\/[\w-]+$/);

    const image = await fetch(`${BASE}${url}`);
    expect(image.headers.get('content-type')).toBe('image/png');
    expect(new Uint8Array(await image.arrayBuffer())).toEqual(bytes);
  });

  it('이미지가 아닌 파일은 거절한다', async () => {
    const form = new FormData();
    form.append('file', new Blob(['hello'], { type: 'text/plain' }), 'a.txt');
    expect((await fetch(`${BASE}/api/images`, { method: 'POST', body: form })).status).toBe(415);
  });

  it('없는 사진은 404', async () => {
    expect((await fetch(`${BASE}/api/images/nope`)).status).toBe(404);
  });
});

import { delay, http, HttpResponse } from 'msw';

import {
  type CountryCode,
  type Customer,
  type CustomsConfig,
  estimateCustoms,
  type Order,
  type OrderStatus,
  requiresPossessionPermit,
  type Sword,
  type SwordCategory,
} from '@snb/domain';

import { createAuthHandlers, findSessionUser } from './auth-handlers';
import { createMemoryImageStore, type ImageStore } from './image-store';

import type { Db } from './db';

export interface CreateOrderBody {
  destination: CountryCode;
  customer: Customer;
  lines: Array<{ swordId: string; quantity: number }>;
  paymentMethod: Order['paymentMethod'];
  permitConfirmed: boolean;
}

export interface ApiError {
  message: string;
  fields?: Record<string, string>;
}

export interface DashboardStats {
  swordCount: number;
  lowStock: number;
  orderCount: number;
  revenue: number;
  pendingPermits: number;
}

const ORDER_STATUSES: OrderStatus[] = ['paid', 'permit-review', 'preparing', 'shipped', 'delivered', 'cancelled'];

const error = (status: number, body: ApiError) => HttpResponse.json(body, { status });

const pad = (value: number, length: number) => String(value).padStart(length, '0');

function nextOrderId(orders: Order[], now: Date): string {
  const day = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  const max = orders.reduce((acc, order) => Math.max(acc, Number(order.id.split('-')[2] ?? 0)), 0);
  return `SNB-${day}-${pad(max + 1, 4)}`;
}

function validateCustomer(customer: Partial<Customer> | undefined): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!customer?.name?.trim()) fields.name = '받는 분 이름을 입력해 주세요.';
  if (!customer?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
    fields.email = '이메일 형식을 확인해 주세요.';
  if (!customer?.phone || customer.phone.replace(/\D/g, '').length < 7) fields.phone = '연락처를 확인해 주세요.';
  if (!customer?.postalCode?.trim()) fields.postalCode = '우편번호를 입력해 주세요.';
  if (!customer?.address?.trim()) fields.address = '주소를 입력해 주세요.';
  return fields;
}

export interface HandlerOptions {
  /** 응답 지연(ms). 테스트에서는 0 */
  latency?: number;
  /** 상품 사진 저장소. 기본은 메모리 */
  images?: ImageStore;
}

/** 올릴 수 있는 사진 크기(어드민이 미리 줄여 보내므로 넉넉히) */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** '*'로 시작해 브라우저(상대 경로)와 Node(절대 경로) 모두에서 맞습니다. */
export function createHandlers(db: Db, options: HandlerOptions = {}) {
  const wait = () => (options.latency ? delay(options.latency) : Promise.resolve());
  const images = options.images ?? createMemoryImageStore();

  return [
    ...createAuthHandlers(db, wait),

    http.post('*/api/images', async ({ request }) => {
      await wait();
      const form = await request.formData().catch(() => null);
      const file = form?.get('file');
      if (!(file instanceof Blob)) return error(400, { message: '사진 파일이 없습니다.' });
      if (!file.type.startsWith('image/')) return error(415, { message: '이미지 파일만 올릴 수 있습니다.' });
      if (file.size > MAX_IMAGE_BYTES) return error(413, { message: '사진은 5MB 이하만 올릴 수 있습니다.' });
      const id = crypto.randomUUID();
      try {
        await images.put(id, { type: file.type, data: await file.arrayBuffer() });
      } catch {
        // 저장하지 못한 사진의 주소를 돌려주면 상품에 깨진 사진이 남으므로 실패로 알립니다.
        return error(507, { message: '사진을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.' });
      }
      return HttpResponse.json({ url: `/api/images/${id}` }, { status: 201 });
    }),

    http.get<{ id: string }>('*/api/images/:id', async ({ params }) => {
      const image = await images.get(params.id);
      if (!image) return new HttpResponse(null, { status: 404 });
      return HttpResponse.arrayBuffer(image.data, {
        headers: { 'Content-Type': image.type, 'Cache-Control': 'private, max-age=31536000, immutable' },
      });
    }),

    http.get('*/api/swords', async ({ request }) => {
      await wait();
      const category = new URL(request.url).searchParams.get('category') as SwordCategory | null;
      const swords = db.read().swords.filter((sword) => !category || sword.category === category);
      return HttpResponse.json(swords);
    }),

    http.get<{ slug: string }>('*/api/swords/:slug', async ({ params }) => {
      await wait();
      const sword = db.read().swords.find((item) => item.slug === params.slug || item.id === params.slug);
      return sword ? HttpResponse.json(sword) : error(404, { message: '상품을 찾을 수 없습니다.' });
    }),

    http.post('*/api/swords', async ({ request }) => {
      await wait();
      const body = (await request.json()) as Omit<Sword, 'id'>;
      if (!body.slug || !body.name) return error(400, { message: '이름과 주소(slug)는 필수입니다.' });
      if (db.read().swords.some((sword) => sword.slug === body.slug)) {
        return error(409, {
          message: '같은 주소(slug)의 상품이 있습니다.',
          fields: { slug: '다른 값을 입력해 주세요.' },
        });
      }
      const id = `sw-${pad(db.read().swords.length + 1, 3)}-${Date.now().toString(36)}`;
      const created: Sword = { ...body, id };
      db.write((state) => ({ ...state, swords: [...state.swords, created] }));
      return HttpResponse.json(created, { status: 201 });
    }),

    http.put<{ id: string }>('*/api/swords/:id', async ({ params, request }) => {
      await wait();
      const body = (await request.json()) as Sword;
      const exists = db.read().swords.some((sword) => sword.id === params.id);
      if (!exists) return error(404, { message: '상품을 찾을 수 없습니다.' });
      const updated: Sword = { ...body, id: params.id };
      db.write((state) => ({
        ...state,
        swords: state.swords.map((sword) => (sword.id === params.id ? updated : sword)),
      }));
      return HttpResponse.json(updated);
    }),

    http.delete<{ id: string }>('*/api/swords/:id', async ({ params }) => {
      await wait();
      db.write((state) => ({ ...state, swords: state.swords.filter((sword) => sword.id !== params.id) }));
      return new HttpResponse(null, { status: 204 });
    }),

    http.get('*/api/customs-config', async () => {
      await wait();
      return HttpResponse.json(db.read().customs);
    }),

    http.put('*/api/customs-config', async ({ request }) => {
      await wait();
      const body = (await request.json()) as CustomsConfig;
      const invalid = Object.entries(body.exchangeRates).find(([, rate]) => !(rate > 0));
      if (invalid) return error(400, { message: `환율은 0보다 커야 합니다: ${invalid[0]}` });
      const next = { ...body, updatedAt: new Date().toISOString() };
      db.write((state) => ({ ...state, customs: next }));
      return HttpResponse.json(next);
    }),

    http.get('*/api/orders', async () => {
      await wait();
      const orders = [...db.read().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return HttpResponse.json(orders);
    }),

    http.get<{ id: string }>('*/api/orders/:id', async ({ params }) => {
      await wait();
      const order = db.read().orders.find((item) => item.id === params.id);
      return order ? HttpResponse.json(order) : error(404, { message: '주문을 찾을 수 없습니다.' });
    }),

    http.post('*/api/orders', async ({ request }) => {
      await wait();
      const body = (await request.json()) as Partial<CreateOrderBody>;
      const state = db.read();
      const fields = validateCustomer(body.customer);

      if (!body.destination || !state.customs.countries.some((country) => country.code === body.destination)) {
        fields.destination = '배송 국가를 선택해 주세요.';
      }
      if (!body.paymentMethod) fields.paymentMethod = '결제 수단을 선택해 주세요.';
      if (!body.lines?.length) return error(400, { message: '장바구니가 비어 있습니다.' });

      const lines = body.lines.map((line) => ({
        line,
        sword: state.swords.find((sword) => sword.id === line.swordId),
      }));
      const missing = lines.find(({ sword }) => !sword);
      if (missing) return error(409, { message: '판매가 끝난 상품이 장바구니에 있습니다.' });

      const shortage = lines.find(({ line, sword }) => sword && sword.stock < line.quantity);
      if (shortage?.sword) {
        return error(409, { message: `${shortage.sword.name}의 재고가 ${shortage.sword.stock}점 남았습니다.` });
      }

      const needsPermit = lines.some(({ sword }) => sword && requiresPossessionPermit(sword.specs));
      if (needsPermit && !body.permitConfirmed) fields.permitConfirmed = '허가 안내를 확인해 주세요.';

      if (Object.keys(fields).length > 0) return error(422, { message: '입력 내용을 확인해 주세요.', fields });

      const orderLines = lines.map(({ line, sword }) => ({
        swordId: sword!.id,
        name: sword!.name,
        origin: sword!.origin,
        unitPrice: sword!.price,
        quantity: line.quantity,
      }));
      const estimate = estimateCustoms(orderLines, body.destination!, state.customs);
      const buyer = findSessionUser(db, request);
      const now = new Date();
      const order: Order = {
        id: nextOrderId(state.orders, now),
        createdAt: now.toISOString(),
        status: needsPermit ? 'permit-review' : 'paid',
        destination: body.destination!,
        // 로그인한 채 주문하면 내 주문 내역에 남도록 회원 id를 붙입니다.
        ...(buyer ? { userId: buyer.id } : {}),
        customer: body.customer as Customer,
        lines: orderLines,
        paymentMethod: body.paymentMethod!,
        permitConfirmed: Boolean(body.permitConfirmed),
        amounts: estimate.totals,
      };

      db.write((current) => ({
        ...current,
        orders: [...current.orders, order],
        swords: current.swords.map((sword) => {
          const ordered = orderLines.find((line) => line.swordId === sword.id);
          return ordered ? { ...sword, stock: sword.stock - ordered.quantity } : sword;
        }),
      }));

      return HttpResponse.json(order, { status: 201 });
    }),

    http.patch<{ id: string }>('*/api/orders/:id', async ({ params, request }) => {
      await wait();
      const { status } = (await request.json()) as { status: OrderStatus };
      if (!ORDER_STATUSES.includes(status)) return error(400, { message: '알 수 없는 주문 상태입니다.' });
      const order = db.read().orders.find((item) => item.id === params.id);
      if (!order) return error(404, { message: '주문을 찾을 수 없습니다.' });
      const updated = { ...order, status };
      db.write((state) => ({ ...state, orders: state.orders.map((item) => (item.id === params.id ? updated : item)) }));
      return HttpResponse.json(updated);
    }),

    http.get('*/api/stats', async () => {
      await wait();
      const { swords, orders } = db.read();
      const active = orders.filter((order) => order.status !== 'cancelled');
      const stats: DashboardStats = {
        swordCount: swords.length,
        lowStock: swords.filter((sword) => sword.stock <= 2).length,
        orderCount: active.length,
        revenue: active.reduce((sum, order) => sum + order.amounts.goods, 0),
        pendingPermits: orders.filter((order) => order.status === 'permit-review').length,
      };
      return HttpResponse.json(stats);
    }),
  ];
}

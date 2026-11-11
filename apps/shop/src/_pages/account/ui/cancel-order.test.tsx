import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createMockServer } from '@snb/mocks/node';

import { useSessionStore } from '@/entities/session';
import { renderWithProviders } from '@/shared/lib/test';

import { CancelOrder } from './cancel-order';

const { server, db } = createMockServer();
let restoreFetch: () => void = () => {};

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
  // jsdom의 fetch는 상대 경로를 해석하지 못하므로, MSW가 감싼 fetch 앞에 기준 주소를 붙입니다.
  const mockedFetch = globalThis.fetch;
  globalThis.fetch = (input, init) =>
    mockedFetch(typeof input === 'string' && input.startsWith('/') ? `http://localhost${input}` : input, init);
  restoreFetch = () => {
    globalThis.fetch = mockedFetch;
  };
});
afterEach(() => {
  server.resetHandlers();
  db.reset();
});
afterAll(() => {
  restoreFetch();
  server.close();
});

const setupMemberOrder = async () => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name: '가상', email: 'cancel@example.com', password: 'sword1234' }),
  });
  const { token, user } = (await response.json()) as { token: string; user: { id: string } };
  useSessionStore.getState().setToken(token);
  db.write((state) => ({
    ...state,
    orders: state.orders.map((order, index) => (index === 0 ? { ...order, status: 'paid', userId: user.id } : order)),
  }));
  return db.read().orders[0]!;
};

describe('CancelOrder', () => {
  afterEach(() => useSessionStore.getState().setToken(null));

  it('확인 버튼으로 초점을 옮기고, 그만두면 처음 버튼으로 돌아온다', async () => {
    renderWithProviders(<CancelOrder orderId="x" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '주문 취소' }));
    expect(screen.getByRole('button', { name: '취소 확정' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '그대로 두기' }));
    expect(screen.getByRole('button', { name: '주문 취소' })).toHaveFocus();
  });

  it('두 번 눌러도 한 번만 취소해 재고를 한 번만 돌려준다', async () => {
    const order = await setupMemberOrder();
    const line = order.lines[0]!;
    const before = db.read().swords.find((sword) => sword.id === line.swordId)!.stock;
    renderWithProviders(<CancelOrder orderId={order.id} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '주문 취소' }));
    await user.dblClick(screen.getByRole('button', { name: '취소 확정' }));
    await waitFor(() => expect(db.read().orders[0]!.status).toBe('cancelled'));
    expect(db.read().swords.find((sword) => sword.id === line.swordId)!.stock).toBe(before + line.quantity);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createMockServer } from '@snb/mocks/node';

import { renderWithProviders } from '@/shared/lib/test';

import { CheckoutForm } from './checkout-form';

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

const setup = (onPlaced = vi.fn()) => {
  renderWithProviders(
    <CheckoutForm
      destination="KR"
      lines={[{ swordId: 'sw-001', quantity: 1 }]}
      needsPermit
      permitNote="허가 안내 문구"
      onPlaced={onPlaced}
    />,
  );
  return { onPlaced, user: userEvent.setup() };
};

describe('CheckoutForm', () => {
  it('빈 채로 제출하면 오류 요약으로 초점을 옮기고 칸마다 안내한다', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '결제하기' }));

    const alert = await screen.findByRole('alert');
    await waitFor(() => expect(alert).toHaveFocus());
    expect(screen.getByRole('link', { name: /받는 분: 받는 분 이름을 입력해 주세요/ })).toHaveAttribute(
      'href',
      '#checkout-name',
    );
    expect(screen.getByLabelText(/받는 분/, { selector: 'input' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(/허가 안내 문구/);
  });

  it('올바르게 채우면 주문을 한 번만 보낸다', async () => {
    const { user, onPlaced } = setup();
    await user.type(screen.getByLabelText(/받는 분/, { selector: 'input' }), '홍길동');
    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/연락처/), '010-1234-5678');
    await user.type(screen.getByLabelText(/우편번호/), '04524');
    await user.type(screen.getByLabelText(/^주소/), '서울 중구 세종대로 110');
    await user.click(screen.getByRole('radio', { name: /신용카드/ }));
    await user.click(screen.getByRole('checkbox'));

    const submit = screen.getByRole('button', { name: '결제하기' });
    await user.dblClick(submit);

    await waitFor(() => expect(onPlaced).toHaveBeenCalledTimes(1));
    expect(db.read().orders.filter((order) => order.customer.name === '홍길동')).toHaveLength(1);
  });
});

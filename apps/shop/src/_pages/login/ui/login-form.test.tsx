import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { hashPassword } from '@snb/mocks';
import { createMockServer } from '@snb/mocks/node';

import { renderWithProviders } from '@/shared/lib/test';

import { LoginForm } from './login-form';

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

const addMember = async () => {
  const email = 'member@example.com';
  const passwordHash = await hashPassword(email, 'sword1234');
  db.write((state) => ({
    ...state,
    users: [{ id: 'u-1', email, name: '회원', createdAt: '2026-11-08T00:00:00.000Z', passwordHash }],
  }));
};

describe('LoginForm', () => {
  it('비밀번호가 틀리면 어느 칸인지 밝히지 않고 알린다', async () => {
    await addMember();
    renderWithProviders(<LoginForm next="/account" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^이메일/), 'member@example.com');
    await user.type(screen.getByLabelText(/^비밀번호( \(|$)/, { selector: 'input' }), 'wrong1234');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('이메일 또는 비밀번호가 맞지 않습니다.');
    await waitFor(() => expect(alert).toHaveFocus());
  });

  it('두 번 눌러도 세션을 하나만 만든다', async () => {
    await addMember();
    renderWithProviders(<LoginForm next="/account" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^이메일/), 'member@example.com');
    await user.type(screen.getByLabelText(/^비밀번호( \(|$)/, { selector: 'input' }), 'sword1234');
    await user.dblClick(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(db.read().sessions).toHaveLength(1));
  });

  it('비밀번호 보기 버튼은 눌림 상태를 알린다', async () => {
    renderWithProviders(<LoginForm next="/account" />);
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: '비밀번호 보기' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(/^비밀번호( \(|$)/, { selector: 'input' })).toHaveAttribute('type', 'text');
  });
});

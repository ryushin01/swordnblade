import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createMockServer } from '@snb/mocks/node';

import { renderWithProviders } from '@/shared/lib/test';

import { SignupForm } from './signup-form';

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

const fill = async (user: ReturnType<typeof userEvent.setup>, email = 'new@example.com') => {
  await user.type(screen.getByLabelText(/^이름/), '홍길동');
  await user.type(screen.getByLabelText(/^이메일/), email);
  await user.type(screen.getByLabelText(/^비밀번호( \(|$)/, { selector: 'input' }), 'sword1234');
  await user.type(screen.getByLabelText(/^비밀번호 확인/, { selector: 'input' }), 'sword1234');
};

describe('SignupForm', () => {
  it('틀린 칸을 오류 요약에 모으고 초점을 옮긴다', async () => {
    renderWithProviders(<SignupForm next="/account" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^비밀번호( \(|$)/, { selector: 'input' }), 'short');
    await user.click(screen.getByRole('button', { name: '가입하기' }));

    const alert = await screen.findByRole('alert');
    await waitFor(() => expect(alert).toHaveFocus());
    expect(screen.getByRole('link', { name: /이름: 이름을 입력해 주세요/ })).toHaveAttribute('href', '#signup-name');
    expect(screen.getByRole('link', { name: /비밀번호 확인: 비밀번호가 서로 다릅니다/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호( \(|$)/, { selector: 'input' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('두 번 눌러도 한 번만 가입한다', async () => {
    renderWithProviders(<SignupForm next="/account" />);
    const user = userEvent.setup();
    await fill(user);
    await user.dblClick(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => expect(db.read().sessions).toHaveLength(1));
    expect(db.read().users?.filter((item) => item.email === 'new@example.com')).toHaveLength(1);
  });

  it('이미 가입한 이메일이면 이메일 칸에 알린다', async () => {
    db.write((state) => ({
      ...state,
      users: [
        {
          id: 'u-1',
          email: 'taken@example.com',
          name: '회원',
          createdAt: '2026-11-08T00:00:00.000Z',
          passwordHash: 'x',
        },
      ],
    }));
    renderWithProviders(<SignupForm next="/account" />);
    const user = userEvent.setup();
    await fill(user, 'taken@example.com');

    await user.click(screen.getByRole('button', { name: '가입하기' }));
    expect(await screen.findByRole('link', { name: /이미 가입한 이메일/ })).toHaveAttribute('href', '#signup-email');
  });
});

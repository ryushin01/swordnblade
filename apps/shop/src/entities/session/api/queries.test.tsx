import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { createMockServer } from '@snb/mocks/node';

import { renderWithProviders } from '@/shared/lib/test';

import { useSessionStore } from '../model/store';
import { useMe } from './queries';

function Probe() {
  const me = useMe();
  return <p>{me.status}</p>;
}

const { server } = createMockServer();
let restoreFetch: () => void = () => {};

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
  const mockedFetch = globalThis.fetch;
  globalThis.fetch = (input, init) =>
    mockedFetch(typeof input === 'string' && input.startsWith('/') ? `http://localhost${input}` : input, init);
  restoreFetch = () => {
    globalThis.fetch = mockedFetch;
  };
});
afterEach(() => {
  server.resetHandlers();
  useSessionStore.getState().setToken(null);
});
afterAll(() => {
  restoreFetch();
  server.close();
});

describe('useMe', () => {
  it('세션이 만료되면(401) 토큰을 지운다', async () => {
    useSessionStore.getState().setToken('expired');
    renderWithProviders(<Probe />);
    await waitFor(() => expect(useSessionStore.getState().token).toBeNull());
  });

  it('네트워크 오류로는 로그아웃하지 않는다', async () => {
    server.use(http.get('*/api/auth/me', () => HttpResponse.error()));
    useSessionStore.getState().setToken('kept');
    renderWithProviders(<Probe />);
    expect(await screen.findByText('error')).toBeInTheDocument();
    expect(useSessionStore.getState().token).toBe('kept');
  });
});

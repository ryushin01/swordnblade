import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { act, render, screen } from '@testing-library/react';

import { useNow } from './use-now';

function Probe() {
  return <p>{useNow()}</p>;
}

const at = (iso: string) => String(Date.parse(iso));

afterEach(() => {
  vi.useRealTimers();
});

describe('useNow', () => {
  it('서버 렌더에서는 next-intl의 요청 시각을 분 단위로 쓴다(hydrate 값과 같게)', () => {
    const html = renderToString(
      <NextIntlClientProvider locale="ko" now={new Date('2026-11-13T10:00:42Z')} timeZone="Asia/Seoul">
        <Probe />
      </NextIntlClientProvider>,
    );
    expect(html).toContain(at('2026-11-13T10:00:00Z'));
  });

  it('브라우저에서는 자기 시계를 쓰고, 분이 바뀌면 다시 그린다', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-11-13T10:00:30Z'));
    render(
      <NextIntlClientProvider locale="ko" now={new Date('2020-01-01T00:00:00Z')} timeZone="Asia/Seoul">
        <Probe />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(at('2026-11-13T10:00:00Z'))).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByText(at('2026-11-13T10:01:00Z'))).toBeInTheDocument();
  });
});

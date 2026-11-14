import { screen, within } from '@testing-library/react';

import { renderWithProviders } from '@/shared/lib/test';

import { LocaleLinks, LocaleSwitch } from './locale-switch';

describe('LocaleSwitch', () => {
  it('언어마다 그 언어로 쓴 링크를 두고, 지금 언어를 aria-current로 알린다', () => {
    renderWithProviders(<LocaleSwitch />);
    const nav = screen.getByRole('navigation', { name: '언어' });
    const korean = within(nav).getByRole('link', { name: '한국어' });
    const english = within(nav).getByRole('link', { name: 'English' });
    expect(korean).toHaveAttribute('aria-current', 'true');
    expect(korean).toHaveAttribute('lang', 'ko');
    expect(english).not.toHaveAttribute('aria-current');
    expect(english).toHaveAttribute('hrefLang', 'en');
    expect(english).toHaveAttribute('href', '/en');
  });

  it('서버 HTML용 링크(LocaleLinks)는 검색 조건 없이 같은 모양으로 그린다', () => {
    const switchView = renderWithProviders(<LocaleSwitch />);
    const withQuery = switchView.container.innerHTML;
    switchView.unmount();
    const { container } = renderWithProviders(<LocaleLinks />);
    // 같은 링크 글자와 구조여야 hydrate 뒤에 머리글 폭이 바뀌지 않습니다.
    expect(container.innerHTML).toBe(withQuery);
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en');
  });

  it('검색 조건을 받으면 언어를 바꿔도 그대로 붙인다', () => {
    renderWithProviders(<LocaleLinks query={{ q: '쌍수도', sort: 'price-desc' }} />);
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      `/en?q=${encodeURIComponent('쌍수도')}&sort=price-desc`,
    );
  });
});

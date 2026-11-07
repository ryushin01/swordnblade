import { screen } from '@testing-library/react';

import { SEED_SWORDS } from '@snb/mocks';

import { renderWithProviders } from '@/shared/lib/test';

import { SwordTile } from './sword-tile';

const sword = SEED_SWORDS[0]!;

describe('SwordTile', () => {
  it('이름과 가격이 링크 이름이 되고 상세로 이동한다', () => {
    renderWithProviders(<SwordTile sword={sword} />);
    const link = screen.getByRole('link', { name: /쌍수도.*6,800,000원/ });
    expect(link).toHaveAttribute('href', '/swords/ssangsudo');
  });

  it('부조 그림은 장식으로 숨긴다', () => {
    const { container } = renderWithProviders(<SwordTile sword={sword} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('재고가 없으면 품절로 보인다', () => {
    renderWithProviders(<SwordTile sword={{ ...sword, stock: 0 }} />);
    expect(screen.getByRole('link', { name: /품절/ })).toBeInTheDocument();
  });
});

describe('SwordTile (영어)', () => {
  it('영어 화면에서는 원화를 ₩로 쓰고 원어 이름을 부제로 보여 준다', () => {
    renderWithProviders(<SwordTile sword={{ ...sword, name: sword.nameEn }} />, { locale: 'en' });
    expect(screen.getByRole('link', { name: /Ssangsudo.*雙手刀.*₩6,800,000/ })).toHaveAttribute(
      'href',
      '/en/swords/ssangsudo',
    );
  });
});

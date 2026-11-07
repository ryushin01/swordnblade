import { render, screen } from '@testing-library/react';
import { SEED_SWORDS } from '@snb/mocks';
import { SwordTile } from './sword-tile';

const sword = SEED_SWORDS[0]!;

describe('SwordTile', () => {
  it('이름과 가격이 링크 이름이 되고 상세로 이동한다', () => {
    render(<SwordTile sword={sword} />);
    const link = screen.getByRole('link', { name: /쌍수도.*6,800,000원/ });
    expect(link).toHaveAttribute('href', '/swords/ssangsudo');
  });

  it('부조 그림은 장식으로 숨긴다', () => {
    const { container } = render(<SwordTile sword={sword} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('재고가 없으면 품절로 보인다', () => {
    render(<SwordTile sword={{ ...sword, stock: 0 }} />);
    expect(screen.getByRole('link', { name: /품절/ })).toBeInTheDocument();
  });
});

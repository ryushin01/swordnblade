import { render, screen } from '@testing-library/react';
import { ScrollRegion } from './scroll-region';

describe('ScrollRegion', () => {
  it('이름 있는 영역이고 키보드 초점을 받는다', () => {
    render(<ScrollRegion label="주문 목록 표">내용</ScrollRegion>);
    const region = screen.getByRole('region', { name: '주문 목록 표' });
    expect(region).toHaveAttribute('tabindex', '0');
  });
});

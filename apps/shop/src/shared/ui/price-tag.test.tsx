import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/shared/lib/test';

import { PriceTag } from './price-tag';

describe('PriceTag', () => {
  it('할인이 없으면 금액만 보여 준다', () => {
    const { container } = renderWithProviders(<PriceTag price={68_000} listPrice={68_000} rate={0} />);
    expect(container.textContent).toBe('68,000원');
    expect(container.querySelector('del')).toBeNull();
  });

  it('할인 중이면 정가에 줄을 긋고, 정가·할인가·할인율을 글자로도 알린다', () => {
    const { container } = renderWithProviders(<PriceTag price={57_800} listPrice={68_000} rate={15} />);
    expect(container.querySelector('del')).toHaveTextContent('정가 68,000원');
    expect(container.textContent).toBe('정가 68,000원 할인가 57,800원 15% 할인');
    expect(screen.getByText('15% 할인')).toBeVisible();
  });

  it('할인율 없이 정가만 주면 할인율 글자는 뺀다(주문 영수증)', () => {
    const { container } = renderWithProviders(<PriceTag price={115_600} listPrice={136_000} />);
    expect(container.textContent).toBe('정가 136,000원 할인가 115,600원');
  });

  it('영어 화면에서는 ₩와 영어 이름을 쓴다', () => {
    const { container } = renderWithProviders(<PriceTag price={57_800} listPrice={68_000} rate={15} />, {
      locale: 'en',
    });
    expect(container.textContent).toBe('Regular price ₩68,000 Sale price ₩57,800 15% off');
  });
});

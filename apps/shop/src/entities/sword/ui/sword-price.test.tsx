import { renderWithProviders } from '@/shared/lib/test';

import { SwordPrice } from './sword-price';

// 시계를 고정하지 않도록 아주 먼 날짜로 기간을 정합니다.
const price = 2_900_000;

describe('SwordPrice', () => {
  it('할인 기간이면 할인가와 할인율을 보여 준다', () => {
    const { container } = renderWithProviders(<SwordPrice sword={{ price, discount: { rate: 10 } }} />);
    expect(container.textContent).toBe('정가 2,900,000원 할인가 2,610,000원 10% 할인');
  });

  it('시작 전이거나 끝난 할인은 정가만 보여 준다', () => {
    const scheduled = renderWithProviders(
      <SwordPrice sword={{ price, discount: { rate: 10, startsAt: '2999-01-01' } }} />,
    );
    expect(scheduled.container.textContent).toBe('2,900,000원');
    scheduled.unmount();
    const ended = renderWithProviders(<SwordPrice sword={{ price, discount: { rate: 10, endsAt: '2000-01-31' } }} />);
    expect(ended.container.textContent).toBe('2,900,000원');
  });
});

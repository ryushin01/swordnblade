import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/shared/lib/test';

import { DiscountPeriod } from './discount-period';

// 시계를 고정하지 않도록 아주 먼 날짜로 기간을 정합니다.

describe('DiscountPeriod', () => {
  it('할인 중이면 끝나는 날을 알린다', () => {
    renderWithProviders(<DiscountPeriod sword={{ discount: { rate: 10, endsAt: '2999-12-31' } }} />);
    expect(screen.getByText('2999년 12월 31일까지 할인')).toBeInTheDocument();
  });

  it('시작 전이면 시작하는 날과 할인율을 알린다', () => {
    renderWithProviders(<DiscountPeriod sword={{ discount: { rate: 15, startsAt: '2999-01-01' } }} />, {
      locale: 'en',
    });
    expect(screen.getByText('15% off from January 1, 2999')).toBeInTheDocument();
  });

  it('기한이 없거나 할인이 없으면 그리지 않는다', () => {
    const { container } = renderWithProviders(
      <>
        <DiscountPeriod sword={{ discount: { rate: 10 } }} />
        <DiscountPeriod sword={{}} />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

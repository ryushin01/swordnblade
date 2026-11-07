import { render, screen, within } from '@testing-library/react';

import { DEFAULT_CUSTOMS_CONFIG, estimateCustoms } from '@snb/domain';

import { CustomsBreakdown } from './customs-breakdown';

describe('CustomsBreakdown', () => {
  it('출고지별 경로와 결제 예정 금액을 보여 준다', () => {
    const estimate = estimateCustoms(
      [
        { origin: 'JP', unitPrice: 4_500_000, quantity: 1 },
        { origin: 'KR', unitPrice: 6_800_000, quantity: 1 },
      ],
      'KR',
      DEFAULT_CUSTOMS_CONFIG,
    );
    render(<CustomsBreakdown estimate={estimate} config={DEFAULT_CUSTOMS_CONFIG} />);

    const shipments = screen.getAllByRole('listitem');
    expect(within(shipments[0]!).getByText('일본 → 대한민국')).toBeInTheDocument();
    expect(within(shipments[1]!).getByText('국내 배송 · 관세 없음')).toBeInTheDocument();
    expect(screen.getByText('결제 예정 금액').nextSibling).toHaveTextContent(
      `${estimate.totals.total.toLocaleString('ko-KR')}원`,
    );
  });

  it('해외 배송이면 현지 통화 환산액을 함께 보여 준다', () => {
    const estimate = estimateCustoms(
      [{ origin: 'KR', unitPrice: 1_390_000, quantity: 1 }],
      'US',
      DEFAULT_CUSTOMS_CONFIG,
    );
    render(<CustomsBreakdown estimate={estimate} config={DEFAULT_CUSTOMS_CONFIG} />);
    expect(screen.getByText(/약 US\$/)).toBeInTheDocument();
  });
});

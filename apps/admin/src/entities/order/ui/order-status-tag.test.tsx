import { render, screen } from '@testing-library/react';
import { OrderStatusTag } from './order-status-tag';

describe('OrderStatusTag', () => {
  it('상태를 색이 아니라 글자로도 보여 준다', () => {
    render(<OrderStatusTag status="permit-review" />);
    expect(screen.getByText('허가 확인 중')).toBeInTheDocument();
  });
});

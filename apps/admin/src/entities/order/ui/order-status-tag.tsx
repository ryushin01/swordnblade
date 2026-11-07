import { Badge } from 'antd';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@snb/domain';

/** 색 점은 보조 표시이고 상태는 글자로 읽힙니다. */
const COLOR: Record<OrderStatus, string> = {
  paid: '#0958d9',
  'permit-review': '#ad6800',
  preparing: '#006d75',
  shipped: '#1d39c4',
  delivered: '#237804',
  cancelled: '#8c8c8c',
};

export function OrderStatusTag({ status }: { status: OrderStatus }) {
  return <Badge color={COLOR[status]} text={ORDER_STATUS_LABEL[status]} />;
}

import type { OrderStatus } from './types';

/** 출고 전이라 회원이 직접 취소할 수 있는 상태 */
const CUSTOMER_CANCELLABLE: OrderStatus[] = ['paid', 'permit-review', 'preparing'];

export const canCustomerCancel = (status: OrderStatus): boolean => CUSTOMER_CANCELLABLE.includes(status);

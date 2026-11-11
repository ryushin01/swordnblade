import type { DbState } from './db';
import type { Order } from '@snb/domain';

/** 주문 수량만큼 재고를 되돌립니다(sign 1) 또는 다시 뺍니다(sign -1). 지워진 도검은 건너뜁니다. */
function moveStock(state: DbState, order: Order, sign: 1 | -1): DbState {
  return {
    ...state,
    swords: state.swords.map((sword) => {
      const quantity = order.lines
        .filter((line) => line.swordId === sword.id)
        .reduce((sum, line) => sum + line.quantity, 0);
      return quantity ? { ...sword, stock: sword.stock + sign * quantity } : sword;
    }),
  };
}

/** 주문을 취소하면서 재고를 되돌립니다. */
export function cancelOrderInState(state: DbState, order: Order): DbState {
  return {
    ...moveStock(state, order, 1),
    orders: state.orders.map((item) => (item.id === order.id ? { ...item, status: 'cancelled' } : item)),
  };
}

/** 취소한 주문을 되살릴 때 재고가 모자란 도검의 이름. 충분하면 undefined */
export function reviveShortage(state: DbState, order: Order): string | undefined {
  return order.lines.find((line) => {
    const sword = state.swords.find((item) => item.id === line.swordId);
    return sword && sword.stock < line.quantity;
  })?.name;
}

/** 취소한 주문을 되살리면서 재고를 다시 뺍니다. */
export function reviveOrderInState(state: DbState, order: Order, status: Order['status']): DbState {
  return {
    ...moveStock(state, order, -1),
    orders: state.orders.map((item) => (item.id === order.id ? { ...item, status } : item)),
  };
}

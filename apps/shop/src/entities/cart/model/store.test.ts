import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_QUANTITY, selectItemCount, useCartStore } from './store';

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ lines: [], destination: 'KR' }));

  it('같은 상품을 담으면 수량을 더한다', () => {
    useCartStore.getState().add('sw-001');
    useCartStore.getState().add('sw-001', 2);
    expect(useCartStore.getState().lines).toEqual([{ swordId: 'sw-001', quantity: 3 }]);
  });

  it('수량은 1~최대 수량 사이로 맞춘다', () => {
    useCartStore.getState().add('sw-002', 99);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(MAX_QUANTITY);
    useCartStore.getState().setQuantity('sw-002', 0);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(1);
  });

  it('총 개수를 센다', () => {
    useCartStore.getState().add('sw-001', 2);
    useCartStore.getState().add('sw-002', 1);
    expect(selectItemCount(useCartStore.getState())).toBe(3);
  });
});

import { safeNextPath } from './safe-next';

describe('safeNextPath', () => {
  it('내부 경로만 받는다', () => {
    expect(safeNextPath('/checkout')).toBe('/checkout');
    expect(safeNextPath('/account?tab=orders')).toBe('/account?tab=orders');
  });

  it('외부 주소나 우회 주소는 기본값으로 돌린다', () => {
    for (const bad of ['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)', '', undefined, null]) {
      expect(safeNextPath(bad)).toBe('/account');
    }
  });
});

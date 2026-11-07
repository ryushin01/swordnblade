import { describe, expect, it } from 'vitest';

import { type CheckoutValues, validateCheckout } from './validate';

const valid: CheckoutValues = {
  name: '홍길동',
  email: 'test@example.com',
  phone: '010-1234-5678',
  postalCode: '04524',
  address: '서울 중구 세종대로 110',
  paymentMethod: 'card',
  permitConfirmed: true,
};

describe('validateCheckout', () => {
  it('모두 맞으면 오류가 없다', () => {
    expect(validateCheckout(valid, true)).toEqual({});
  });

  it('허가 확인은 진검이 있을 때만 필요하다', () => {
    const values = { ...valid, permitConfirmed: false };
    expect(validateCheckout(values, true).permitConfirmed).toBeDefined();
    expect(validateCheckout(values, false).permitConfirmed).toBeUndefined();
  });

  it('형식이 틀린 칸마다 안내를 준다', () => {
    const errors = validateCheckout({ ...valid, email: 'nope', phone: '12', paymentMethod: '' }, false);
    expect(Object.keys(errors).sort()).toEqual(['email', 'paymentMethod', 'phone']);
  });
});

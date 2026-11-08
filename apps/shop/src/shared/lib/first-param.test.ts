import { firstParam } from './first-param';

describe('firstParam', () => {
  it('배열이면 첫 값, 아니면 그대로 돌려준다', () => {
    expect(firstParam(['a', 'b'])).toBe('a');
    expect(firstParam('a')).toBe('a');
    expect(firstParam(undefined)).toBeUndefined();
  });
});

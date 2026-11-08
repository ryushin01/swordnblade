import { pushRecent } from './recent-store';

describe('pushRecent', () => {
  it('맨 앞에 넣고 중복을 없애며 개수를 제한한다', () => {
    expect(pushRecent(['a', 'b'], 'b')).toEqual(['b', 'a']);
    expect(pushRecent(['a', 'b', 'c'], 'd', 3)).toEqual(['d', 'a', 'b']);
  });
});

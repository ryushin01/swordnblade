import { safeJsonStorage } from './safe-storage';

describe('safeJsonStorage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('저장하다 용량 초과가 나도 예외를 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => safeJsonStorage?.setItem('k', { state: {}, version: 0 })).not.toThrow();
  });

  it('깨진 JSON은 없는 것으로 본다', () => {
    localStorage.setItem('broken', '{oops');
    expect(safeJsonStorage?.getItem('broken')).toBeNull();
  });
});

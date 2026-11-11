import { SITE } from '@/shared/config';

import { toValidIds, useWishlistStore } from './store';

describe('useWishlistStore', () => {
  beforeEach(() => useWishlistStore.setState({ ids: [] }));

  it('한 번 누르면 담고 다시 누르면 뺀다', () => {
    const { toggle } = useWishlistStore.getState();
    toggle('sw-001');
    toggle('sw-002');
    expect(useWishlistStore.getState().ids).toEqual(['sw-001', 'sw-002']);
    toggle('sw-001');
    expect(useWishlistStore.getState().ids).toEqual(['sw-002']);
  });

  it('깨진 저장값은 문자열 배열만 남긴다', () => {
    expect(toValidIds('oops')).toEqual([]);
    expect(toValidIds(['a', 1, null, 'b'])).toEqual(['a', 'b']);
  });

  it('저장값이 JSON으로 깨져 있어도 불러오기를 끝내고 빈 목록으로 시작한다', async () => {
    localStorage.setItem(SITE.wishlistStorageKey, '{broken');
    await useWishlistStore.persist.rehydrate();
    expect(useWishlistStore.persist.hasHydrated()).toBe(true);
    expect(useWishlistStore.getState().ids).toEqual([]);
    expect(localStorage.getItem(SITE.wishlistStorageKey)).not.toBe('{broken');
  });
});

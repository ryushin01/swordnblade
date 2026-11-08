import { useWishlistStore } from './store';

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
});

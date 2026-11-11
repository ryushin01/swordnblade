import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useWishlistStore } from '@/entities/wishlist';
import { renderWithProviders } from '@/shared/lib/test';

import { WishlistButton } from './wishlist-button';

describe('WishlistButton', () => {
  beforeEach(() => useWishlistStore.setState({ ids: [] }));

  it('누르면 눌림 상태와 찜 목록이 함께 바뀐다', async () => {
    renderWithProviders(<WishlistButton swordId="sw-001" />);
    const user = userEvent.setup();
    const button = await screen.findByRole('button', { name: '찜하기' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(useWishlistStore.getState().ids).toEqual(['sw-001']);
  });
});

import { WishlistButton } from './wishlist-button';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/sword/WishlistButton',
  component: WishlistButton,
  args: { swordId: 'sw-001' },
} satisfies Meta<typeof WishlistButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

import { Avatar } from './avatar';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'shared/Avatar',
  component: Avatar,
  args: { name: '김*상' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {};
export const BrokenPhotoFallsBack: Story = { args: { src: '/no-such-image.jpg' } };

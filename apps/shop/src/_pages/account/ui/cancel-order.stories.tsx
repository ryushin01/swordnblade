import { CancelOrder } from './cancel-order';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/account/CancelOrder',
  component: CancelOrder,
  parameters: { layout: 'padded' },
  args: { orderId: 'SNB-20261103-0002' },
} satisfies Meta<typeof CancelOrder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

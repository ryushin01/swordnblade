import { fn } from 'storybook/test';

import { CheckoutForm } from './checkout-form';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/checkout/CheckoutForm',
  component: CheckoutForm,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    destination: 'KR',
    lines: [{ swordId: 'sw-001', quantity: 1 }],
    needsPermit: true,
    permitNote: '도검은 목록통관 대상이 아니며 경찰청 수입허가를 받아 일반 수입신고를 해야 합니다.',
    onPlaced: fn(),
  },
} satisfies Meta<typeof CheckoutForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPermit: Story = {};
export const DecorativeOnly: Story = { args: { needsPermit: false } };

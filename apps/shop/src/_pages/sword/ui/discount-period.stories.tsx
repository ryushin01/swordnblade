import { DiscountPeriod } from './discount-period';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/sword/DiscountPeriod',
  component: DiscountPeriod,
  args: { sword: { discount: { rate: 10, endsAt: '2999-12-31' } }, className: 'text-sm text-ink-muted' },
} satisfies Meta<typeof DiscountPeriod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EndsOn: Story = {};
export const StartsOn: Story = { args: { sword: { discount: { rate: 15, startsAt: '2999-01-01' } } } };

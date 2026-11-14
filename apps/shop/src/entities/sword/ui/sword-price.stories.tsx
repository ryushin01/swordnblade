import { SwordPrice } from './sword-price';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'entities/sword/SwordPrice',
  component: SwordPrice,
  args: { sword: { price: 2_900_000, discount: { rate: 10 } }, size: 'lg' },
} satisfies Meta<typeof SwordPrice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnSale: Story = {};
export const Inline: Story = { args: { size: 'inherit' } };
/** 시작 전인 할인은 정가로 보입니다. */
export const Upcoming: Story = {
  args: { sword: { price: 2_900_000, discount: { rate: 15, startsAt: '2999-01-01' } } },
};
export const NoDiscount: Story = { args: { sword: { price: 2_900_000 } } };

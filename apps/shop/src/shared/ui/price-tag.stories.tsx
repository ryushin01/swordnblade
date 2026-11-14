import { PriceTag } from './price-tag';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'shared/ui/PriceTag',
  component: PriceTag,
  args: { price: 57_800, listPrice: 68_000, rate: 15 },
} satisfies Meta<typeof PriceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnSale: Story = {};
export const Large: Story = { args: { size: 'lg' } };
export const NoDiscount: Story = { args: { price: 68_000, listPrice: 68_000, rate: 0 } };
/** 주문 영수증처럼 할인율 없이 정가만 아는 경우 */
export const WithoutRate: Story = { args: { price: 115_600, listPrice: 136_000, rate: undefined } };

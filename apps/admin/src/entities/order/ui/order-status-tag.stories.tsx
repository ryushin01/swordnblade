import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Flex } from 'antd';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@snb/domain';
import { OrderStatusTag } from './order-status-tag';

const meta = { title: 'entities/order/OrderStatusTag', component: OrderStatusTag, args: { status: 'paid' } } satisfies Meta<
  typeof OrderStatusTag
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Paid: Story = {};
export const All: Story = {
  render: () => (
    <Flex vertical gap={8}>
      {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((status) => (
        <OrderStatusTag key={status} status={status} />
      ))}
    </Flex>
  ),
};

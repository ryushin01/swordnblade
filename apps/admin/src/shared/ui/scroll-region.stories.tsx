import { Table } from 'antd';

import { ScrollRegion } from './scroll-region';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'shared/ui/ScrollRegion',
  component: ScrollRegion,
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: '예시 표',
    children: (
      <Table
        style={{ minWidth: 720 }}
        rowKey="a"
        pagination={false}
        dataSource={[{ a: 'SNB-0001', b: '김가상', c: '대한민국', d: '5,446,980원' }]}
        columns={['a', 'b', 'c', 'd'].map((key) => ({ title: key.toUpperCase(), dataIndex: key }))}
      />
    ),
  },
} satisfies Meta<typeof ScrollRegion>;
export default meta;
export const WideTable: StoryObj<typeof meta> = {};

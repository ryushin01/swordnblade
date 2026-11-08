import { Pagination } from './pagination';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/home/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  args: { page: 1, pages: 9, query: {} },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {};
export const MiddlePage: Story = { args: { page: 5, query: { category: 'legend' } } };
export const LastPage: Story = { args: { page: 9 } };

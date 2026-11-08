import { CategoryNav } from './category-nav';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/home/CategoryNav',
  component: CategoryNav,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CategoryNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
export const Legend: Story = { args: { current: 'legend' } };

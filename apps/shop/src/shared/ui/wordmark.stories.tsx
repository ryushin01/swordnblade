import { OrnamentHeading } from './ornament-heading';
import { Wordmark } from './wordmark';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = { title: 'shared/ui/Wordmark', component: Wordmark } satisfies Meta<typeof Wordmark>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Heading: StoryObj<typeof OrnamentHeading> = {
  render: () => (
    <div style={{ width: 360 }}>
      <OrnamentHeading>전해지는 이야기</OrnamentHeading>
    </div>
  ),
};

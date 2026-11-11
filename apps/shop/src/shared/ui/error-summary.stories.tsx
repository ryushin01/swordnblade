import { ErrorSummary } from './error-summary';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'shared/ErrorSummary',
  component: ErrorSummary,
  args: {
    id: 'story-error',
    summaryRef: { current: null },
    message: '입력 내용을 확인해 주세요.',
    items: [{ fieldId: 'email', text: '이메일: 형식을 확인해 주세요.' }],
  },
} satisfies Meta<typeof ErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithFields: Story = {};
export const MessageOnly: Story = { args: { items: [] } };

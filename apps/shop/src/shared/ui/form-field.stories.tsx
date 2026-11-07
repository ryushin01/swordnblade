import { TextField } from './form-field';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'shared/ui/TextField',
  component: TextField,
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: { label: '이메일', name: 'email', type: 'email', required: true, hint: '주문 확인 메일을 보내 드립니다.' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithError: Story = {
  args: { defaultValue: 'nope', error: '이메일을 example@domain.com 형식으로 입력해 주세요.' },
};

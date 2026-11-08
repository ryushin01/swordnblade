import { LoginForm } from './login-form';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/login/LoginForm',
  component: LoginForm,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448 }}>
        <Story />
      </div>
    ),
  ],
  args: { next: '/account' },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

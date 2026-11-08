import { SignupForm } from './signup-form';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'pages/signup/SignupForm',
  component: SignupForm,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448 }}>
        <Story />
      </div>
    ),
  ],
  args: { next: '/account' },
} satisfies Meta<typeof SignupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

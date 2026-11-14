import { LocaleLinks, LocaleSwitch } from './locale-switch';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'widgets/site-header/LocaleSwitch',
  component: LocaleSwitch,
} satisfies Meta<typeof LocaleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** 서버 HTML(Suspense 대기 화면)에 그려 두는 모양. 검색 조건만 빠지고 모양은 같습니다. */
export const ServerFallback: Story = { render: () => <LocaleLinks /> };

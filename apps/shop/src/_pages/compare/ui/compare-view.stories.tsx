import { SEED_SWORDS } from '@snb/mocks';

import { CompareView } from './compare-view';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const options = SEED_SWORDS.slice(0, 12).map(({ slug, name, category }) => ({ slug, name, category }));

const meta = {
  title: 'pages/compare/CompareView',
  component: CompareView,
  parameters: { layout: 'padded' },
  args: { slugs: [], options, initialSwords: [] },
} satisfies Meta<typeof CompareView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const ThreeSwords: Story = {
  args: {
    slugs: ['ssangsudo', 'hwando', 'wakizashi'],
    initialSwords: SEED_SWORDS.filter((sword) => ['ssangsudo', 'hwando', 'wakizashi'].includes(sword.slug)),
  },
};

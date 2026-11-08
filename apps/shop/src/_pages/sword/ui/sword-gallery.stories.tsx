import { SEED_SWORDS } from '@snb/mocks';

import { SwordGallery } from './sword-gallery';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const sword = SEED_SWORDS[0]!;

const meta = {
  title: 'pages/sword/SwordGallery',
  component: SwordGallery,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 560, height: 680 }}>
        <Story />
      </div>
    ),
  ],
  args: { sword, reliefLabel: `${sword.name} 부조 일러스트: ${sword.summary}` },
} satisfies Meta<typeof SwordGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 부조 그림 세 장(전체·손잡이·칼끝 확대) */
export const ReliefViews: Story = {};

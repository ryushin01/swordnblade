import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SEED_SWORDS } from '@snb/mocks';
import { SwordTile } from './sword-tile';

const meta = {
  title: 'entities/sword/SwordTile',
  component: SwordTile,
  decorators: [(Story) => <div style={{ width: 320, border: '1px solid #c9c7c0' }}><Story /></div>],
  args: { sword: SEED_SWORDS[0]! },
} satisfies Meta<typeof SwordTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ssangsudo: Story = {};
export const Excalibur: Story = { args: { sword: SEED_SWORDS.find((s) => s.slug === 'excalibur')! } };
export const SoldOut: Story = { args: { sword: { ...SEED_SWORDS[3]!, stock: 0 } } };

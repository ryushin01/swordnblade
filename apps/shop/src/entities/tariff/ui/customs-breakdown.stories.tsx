import { DEFAULT_CUSTOMS_CONFIG, estimateCustoms } from '@snb/domain';

import { CustomsBreakdown } from './customs-breakdown';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'entities/tariff/CustomsBreakdown',
  component: CustomsBreakdown,
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    config: DEFAULT_CUSTOMS_CONFIG,
    estimate: estimateCustoms(
      [
        { origin: 'JP', unitPrice: 4_500_000, quantity: 1 },
        { origin: 'KR', unitPrice: 6_800_000, quantity: 1 },
      ],
      'KR',
      DEFAULT_CUSTOMS_CONFIG,
    ),
  },
} satisfies Meta<typeof CustomsBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 해외 직구(일본 출고)와 국내 출고가 섞인 장바구니 */
export const ImportToKorea: Story = {};

/** 한국에서 미국으로 보내는 경우: FOB 기준, 부가세 없음 */
export const ExportToUS: Story = {
  args: {
    estimate: estimateCustoms([{ origin: 'KR', unitPrice: 6_800_000, quantity: 1 }], 'US', DEFAULT_CUSTOMS_CONFIG),
  },
};

/** 영국: 관세는 면제지만 부가세는 과세 */
export const VatOnlyUK: Story = {
  args: {
    estimate: estimateCustoms([{ origin: 'KR', unitPrice: 180_000, quantity: 1 }], 'GB', DEFAULT_CUSTOMS_CONFIG),
  },
};

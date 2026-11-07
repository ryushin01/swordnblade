import { describe, expect, it } from 'vitest';

import { DEFAULT_CUSTOMS_CONFIG } from './constants';
import { estimateCustoms, floorTo10, requiresPossessionPermit } from './customs';

import type { CustomsConfig } from './types';

const config = DEFAULT_CUSTOMS_CONFIG;

describe('estimateCustoms: 해외 → 한국(직구)', () => {
  it('일본발 카타나 3,000,000원: CIF 기준 관세 8%, 부가세 10%', () => {
    const result = estimateCustoms([{ origin: 'JP', unitPrice: 3_000_000, quantity: 1 }], 'KR', config);
    const [shipment] = result.shipments;

    // 과세가격 = 3,000,000 + 85,000
    expect(shipment?.dutiableValue).toBe(3_085_000);
    expect(shipment?.duty).toBe(246_800);
    // (3,085,000 + 246,800) × 10%
    expect(shipment?.vat).toBe(333_180);
    expect(result.totals.total).toBe(3_000_000 + 85_000 + 246_800 + 333_180);
  });

  it('물품가격 150달러 이하면 면세', () => {
    const result = estimateCustoms([{ origin: 'GB', unitPrice: 150 * 1390, quantity: 1 }], 'KR', config);
    expect(result.shipments[0]?.dutyExempt).toBe(true);
    expect(result.totals.duty + result.totals.vat).toBe(0);
  });

  it('미국발은 200달러까지 면세', () => {
    const price = 180 * 1390;
    const fromUS = estimateCustoms([{ origin: 'US', unitPrice: price, quantity: 1 }], 'KR', config);
    const fromGB = estimateCustoms([{ origin: 'GB', unitPrice: price, quantity: 1 }], 'KR', config);

    expect(fromUS.shipments[0]?.appliedDutyFreeLimit).toBe(200);
    expect(fromUS.shipments[0]?.dutyExempt).toBe(true);
    expect(fromGB.shipments[0]?.dutyExempt).toBe(false);
  });

  it('국내 출고는 국내 배송비만 붙고 세금이 없다', () => {
    const result = estimateCustoms([{ origin: 'KR', unitPrice: 5_000_000, quantity: 2 }], 'KR', config);
    expect(result.shipments[0]).toMatchObject({ domestic: true, shipping: 15_000, duty: 0, vat: 0 });
  });

  it('출고지가 여러 곳이면 출고지별로 묶어 계산한다', () => {
    const result = estimateCustoms(
      [
        { origin: 'JP', unitPrice: 1_000_000, quantity: 1 },
        { origin: 'JP', unitPrice: 2_000_000, quantity: 1 },
        { origin: 'KR', unitPrice: 4_000_000, quantity: 1 },
      ],
      'KR',
      config,
    );
    expect(result.shipments).toHaveLength(2);
    expect(result.totals.shipping).toBe(85_000 + 15_000);
    expect(result.shipments.find((s) => s.origin === 'JP')?.goods).toBe(3_000_000);
  });
});

describe('estimateCustoms: 한국 → 해외', () => {
  it('미국은 FOB 기준이라 운임을 과세가격에 넣지 않고 부가세가 없다', () => {
    const result = estimateCustoms([{ origin: 'KR', unitPrice: 2_000_000, quantity: 1 }], 'US', config);
    expect(result.shipments[0]).toMatchObject({ dutiableValue: 2_000_000, duty: 80_000, vat: 0 });
  });

  it('영국은 관세 면세 한도를 넘지 않아도 부가세를 매긴다', () => {
    const price = 100 * 1830;
    const result = estimateCustoms([{ origin: 'KR', unitPrice: price, quantity: 1 }], 'GB', config);
    expect(result.shipments[0]?.dutyExempt).toBe(true);
    expect(result.shipments[0]?.vatExempt).toBe(false);
    expect(result.shipments[0]?.vat).toBe(floorTo10((price + 85_000) * 0.2));
  });

  it('수량 0인 줄은 무시한다', () => {
    const result = estimateCustoms([{ origin: 'KR', unitPrice: 1_000, quantity: 0 }], 'JP', config);
    expect(result.shipments).toHaveLength(0);
    expect(result.totals.total).toBe(0);
  });

  it('규칙이 없는 국가는 오류', () => {
    const empty: CustomsConfig = { ...config, countries: [] };
    expect(() => estimateCustoms([], 'KR', empty)).toThrow();
  });
});

describe('requiresPossessionPermit', () => {
  it('칼날 15cm 이상 진검만 소지허가 대상', () => {
    expect(requiresPossessionPermit({ bladeLength: 150, edge: 'sharp' })).toBe(true);
    expect(requiresPossessionPermit({ bladeLength: 149, edge: 'sharp' })).toBe(false);
    expect(requiresPossessionPermit({ bladeLength: 900, edge: 'blunt' })).toBe(false);
  });
});

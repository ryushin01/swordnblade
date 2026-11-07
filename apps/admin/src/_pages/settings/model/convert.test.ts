import { DEFAULT_CUSTOMS_CONFIG } from '@snb/domain';
import { fromForm, toForm } from './convert';

describe('관세 설정 폼 변환', () => {
  it('세율을 %로 보여 주고 저장할 때 0~1로 되돌린다', () => {
    const form = toForm(DEFAULT_CUSTOMS_CONFIG);
    expect(form.countries[0]?.dutyRate).toBeCloseTo(8);

    form.countries[0]!.dutyRate = 6.5;
    const saved = fromForm(form, DEFAULT_CUSTOMS_CONFIG);
    expect(saved.countries[0]?.dutyRate).toBeCloseTo(0.065);
    expect(saved.countries[0]?.permitNote).toBe(DEFAULT_CUSTOMS_CONFIG.countries[0]?.permitNote);
  });

  it('원화 환율은 항상 1로 고정한다', () => {
    const form = toForm(DEFAULT_CUSTOMS_CONFIG);
    form.exchangeRates.KRW = 999;
    expect(fromForm(form, DEFAULT_CUSTOMS_CONFIG).exchangeRates.KRW).toBe(1);
  });
});

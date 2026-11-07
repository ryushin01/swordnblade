import type { CountryRule, CustomsConfig } from '@snb/domain';

/** 화면에서는 세율을 %로 다루고, 저장할 때 0~1로 바꿉니다. */
export type RuleForm = Omit<CountryRule, 'dutyRate' | 'vatRate'> & { dutyRate: number; vatRate: number };
export type SettingsForm = Omit<CustomsConfig, 'countries'> & { countries: RuleForm[] };

export const toForm = (config: CustomsConfig): SettingsForm => ({
  ...config,
  countries: config.countries.map((rule) => ({ ...rule, dutyRate: rule.dutyRate * 100, vatRate: rule.vatRate * 100 })),
});

export const fromForm = (values: SettingsForm, base: CustomsConfig): CustomsConfig => ({
  ...base,
  exchangeRates: { ...base.exchangeRates, ...values.exchangeRates, KRW: 1 },
  shipping: values.shipping,
  countries: base.countries.map((rule, index) => {
    const edited = values.countries[index]!;
    return {
      ...rule,
      dutyRate: Number(edited.dutyRate) / 100,
      vatRate: Number(edited.vatRate) / 100,
      dutyFreeLimit: Number(edited.dutyFreeLimit),
      vatFreeLimit: Number(edited.vatFreeLimit),
    };
  }),
});

import type { CountryCode, CountryRule, CustomsConfig } from './types';

export interface CustomsLineInput {
  origin: CountryCode;
  /** 원화 단가 */
  unitPrice: number;
  quantity: number;
}

export interface ShipmentEstimate {
  origin: CountryCode;
  domestic: boolean;
  goods: number;
  shipping: number;
  /** 물품가격을 면세 한도 통화로 바꾼 값 */
  goodsInLimitCurrency: number;
  /** 이 출발지에 적용된 관세 면세 한도(한도 통화 기준) */
  appliedDutyFreeLimit: number;
  dutyExempt: boolean;
  vatExempt: boolean;
  /** 과세가격(원) */
  dutiableValue: number;
  duty: number;
  vat: number;
}

export interface CustomsEstimate {
  destination: CountryCode;
  shipments: ShipmentEstimate[];
  totals: { goods: number; shipping: number; duty: number; vat: number; total: number };
}

/** 원 단위 아래를 버리고 10원 단위로 맞춥니다. (관세·부가세 10원 미만 절사) */
export const floorTo10 = (value: number): number => Math.floor(value / 10) * 10;

export function findCountryRule(config: CustomsConfig, code: CountryCode): CountryRule {
  const rule = config.countries.find((country) => country.code === code);
  if (!rule) throw new Error(`관세 규칙이 없는 국가입니다: ${code}`);
  return rule;
}

export function toCurrency(krw: number, currency: keyof CustomsConfig['exchangeRates'], config: CustomsConfig): number {
  const rate = config.exchangeRates[currency];
  if (!rate || rate <= 0) throw new Error(`환율이 올바르지 않습니다: ${currency}`);
  return krw / rate;
}

/**
 * 출고지(origin)별로 묶어 배송 1건씩 관세·부가세를 계산합니다.
 * - 출고지와 배송지가 같으면 국내 배송으로 보고 세금을 매기지 않습니다.
 * - 면세 판단은 물품가격만 보고, 과세가격은 국가 규칙(CIF/FOB)을 따릅니다.
 * - 부가세 과세표준은 과세가격 + 관세입니다.
 */
export function estimateCustoms(
  lines: CustomsLineInput[],
  destination: CountryCode,
  config: CustomsConfig,
): CustomsEstimate {
  const rule = findCountryRule(config, destination);
  const byOrigin = new Map<CountryCode, number>();

  for (const line of lines) {
    if (line.quantity <= 0) continue;
    byOrigin.set(line.origin, (byOrigin.get(line.origin) ?? 0) + line.unitPrice * line.quantity);
  }

  const shipments: ShipmentEstimate[] = [...byOrigin.entries()].map(([origin, goods]) => {
    const domestic = origin === destination;
    const shipping = domestic ? config.shipping.domestic : config.shipping.international;
    const goodsInLimitCurrency = toCurrency(goods, rule.limitCurrency, config);
    const originLimit = rule.originLimits?.[origin];
    const dutyLimit = originLimit ?? rule.dutyFreeLimit;
    const vatLimit = originLimit ?? rule.vatFreeLimit;

    if (domestic) {
      return {
        origin,
        domestic,
        goods,
        shipping,
        goodsInLimitCurrency,
        appliedDutyFreeLimit: dutyLimit,
        dutyExempt: true,
        vatExempt: true,
        dutiableValue: 0,
        duty: 0,
        vat: 0,
      };
    }

    const dutyExempt = goodsInLimitCurrency <= dutyLimit;
    const vatExempt = goodsInLimitCurrency <= vatLimit;
    const dutiableValue = rule.valuation === 'CIF' ? goods + shipping : goods;
    const duty = dutyExempt ? 0 : floorTo10(dutiableValue * rule.dutyRate);
    const vat = vatExempt ? 0 : floorTo10((dutiableValue + duty) * rule.vatRate);

    return {
      origin,
      domestic,
      goods,
      shipping,
      goodsInLimitCurrency,
      appliedDutyFreeLimit: dutyLimit,
      dutyExempt,
      vatExempt,
      dutiableValue,
      duty,
      vat,
    };
  });

  const totals = shipments.reduce(
    (sum, shipment) => ({
      goods: sum.goods + shipment.goods,
      shipping: sum.shipping + shipment.shipping,
      duty: sum.duty + shipment.duty,
      vat: sum.vat + shipment.vat,
      total: 0,
    }),
    { goods: 0, shipping: 0, duty: 0, vat: 0, total: 0 },
  );
  totals.total = totals.goods + totals.shipping + totals.duty + totals.vat;

  return { destination, shipments, totals };
}

/** 칼날 15cm 이상인 진검은 한국에서 소지허가 대상입니다. */
export const PERMIT_BLADE_LENGTH_MM = 150;

export function requiresPossessionPermit(specs: { bladeLength: number; edge: 'sharp' | 'blunt' }): boolean {
  return specs.edge === 'sharp' && specs.bladeLength >= PERMIT_BLADE_LENGTH_MM;
}

import type { CountryCode, CustomsConfig, OrderStatus, SwordCategory } from './types';

export const CATEGORY_LABEL: Record<SwordCategory, string> = {
  east: '동양 도검',
  west: '서양 도검',
  legend: '신화·전설',
};

export const CATEGORY_LABEL_EN: Record<SwordCategory, string> = {
  east: 'Eastern',
  west: 'Western',
  legend: 'Myth & Legend',
};

export const COUNTRY_NAME: Record<CountryCode, string> = {
  KR: '대한민국',
  JP: '일본',
  CN: '중국',
  US: '미국',
  GB: '영국',
  DE: '독일',
  FR: '프랑스',
  IT: '이탈리아',
  NO: '노르웨이',
  GR: '그리스',
  AU: '호주',
  CA: '캐나다',
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  paid: '결제 완료',
  'permit-review': '허가 확인 중',
  preparing: '출고 준비',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소',
};

/**
 * 포트폴리오용 예시 값입니다. 실제 세율·한도·환율과 다를 수 있으며 어드민에서 바꿀 수 있습니다.
 * 도검은 HS 9307(칼·검과 그 칼집) 기준으로 잡았습니다.
 */
export const DEFAULT_CUSTOMS_CONFIG: CustomsConfig = {
  exchangeRates: {
    KRW: 1,
    USD: 1390,
    JPY: 9.1,
    CNY: 195,
    GBP: 1830,
    EUR: 1600,
    AUD: 910,
    CAD: 1000,
  },
  shipping: { domestic: 15000, international: 85000 },
  countries: [
    {
      code: 'KR',
      name: '대한민국',
      currency: 'KRW',
      dutyRate: 0.08,
      vatRate: 0.1,
      dutyFreeLimit: 150,
      vatFreeLimit: 150,
      limitCurrency: 'USD',
      originLimits: { US: 200 },
      valuation: 'CIF',
      permitNote:
        '도검은 목록통관 대상이 아니며 경찰청 수입허가를 받아 일반 수입신고를 해야 합니다. 칼날 15cm 이상 진검은 관할 경찰서 소지허가가 필요합니다.',
      permitNoteEn:
        'Swords cannot use simplified list clearance; a formal import declaration with an import permit from the Korean National Police Agency is required. Sharp blades of 15 cm or longer need a possession permit from the local police station.',
    },
    {
      code: 'US',
      name: '미국',
      currency: 'USD',
      dutyRate: 0.04,
      vatRate: 0,
      dutyFreeLimit: 0,
      vatFreeLimit: 0,
      limitCurrency: 'USD',
      valuation: 'FOB',
      permitNote: '소액 면세(de minimis)가 없는 것으로 가정했습니다. 주(州)마다 도검 소지 규정이 다릅니다.',
      permitNoteEn: 'Assumes no de minimis exemption. Rules on owning swords differ by state.',
    },
    {
      code: 'JP',
      name: '일본',
      currency: 'JPY',
      dutyRate: 0.046,
      vatRate: 0.1,
      dutyFreeLimit: 10000,
      vatFreeLimit: 10000,
      limitCurrency: 'JPY',
      valuation: 'CIF',
      permitNote: '도검류는 도도부현 교육위원회 등록증 또는 소지허가가 필요합니다.',
      permitNoteEn:
        'Swords require a registration certificate from the prefectural board of education or a possession permit.',
    },
    {
      code: 'GB',
      name: '영국',
      currency: 'GBP',
      dutyRate: 0.04,
      vatRate: 0.2,
      dutyFreeLimit: 135,
      vatFreeLimit: 0,
      limitCurrency: 'GBP',
      valuation: 'CIF',
      permitNote: '만곡 도검 등 일부 품목은 수입이 제한됩니다. 18세 이상 연령 확인이 필요합니다.',
      permitNoteEn:
        'Some items, such as curved swords, are restricted from import. Age verification (18+) is required.',
    },
    {
      code: 'DE',
      name: '독일',
      currency: 'EUR',
      dutyRate: 0.017,
      vatRate: 0.19,
      dutyFreeLimit: 150,
      vatFreeLimit: 0,
      limitCurrency: 'EUR',
      valuation: 'CIF',
      permitNote: '무기법(WaffG)에 따라 공공장소 휴대가 제한됩니다.',
      permitNoteEn: 'Carrying in public is restricted under the Weapons Act (WaffG).',
    },
    {
      code: 'FR',
      name: '프랑스',
      currency: 'EUR',
      dutyRate: 0.017,
      vatRate: 0.2,
      dutyFreeLimit: 150,
      vatFreeLimit: 0,
      limitCurrency: 'EUR',
      valuation: 'CIF',
      permitNote: '도검은 D 등급 무기로 분류되어 정당한 사유 없는 휴대가 금지됩니다.',
      permitNoteEn: 'Swords are category D weapons; carrying them without a legitimate reason is prohibited.',
    },
    {
      code: 'AU',
      name: '호주',
      currency: 'AUD',
      dutyRate: 0.05,
      vatRate: 0.1,
      dutyFreeLimit: 1000,
      vatFreeLimit: 1000,
      limitCurrency: 'AUD',
      valuation: 'FOB',
      permitNote: '주에 따라 도검 수입 시 B709A 허가서가 필요할 수 있습니다.',
      permitNoteEn: 'Depending on the state, a B709A permit may be required to import swords.',
    },
    {
      code: 'CA',
      name: '캐나다',
      currency: 'CAD',
      dutyRate: 0.065,
      vatRate: 0.05,
      dutyFreeLimit: 150,
      vatFreeLimit: 40,
      limitCurrency: 'CAD',
      valuation: 'FOB',
      permitNote: '일부 도검은 금지 무기로 분류될 수 있습니다.',
      permitNoteEn: 'Some swords may be classified as prohibited weapons.',
    },
  ],
  updatedAt: '2026-11-01T00:00:00.000Z',
};

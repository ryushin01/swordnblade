/** ISO 3166-1 alpha-2 국가 코드 중 이 쇼핑몰에서 쓰는 것 */
export type CountryCode = 'KR' | 'JP' | 'CN' | 'US' | 'GB' | 'DE' | 'FR' | 'IT' | 'NO' | 'GR' | 'AU' | 'CA';

export type CurrencyCode = 'KRW' | 'USD' | 'JPY' | 'CNY' | 'GBP' | 'EUR' | 'AUD' | 'CAD';

export type SwordCategory = 'east' | 'west' | 'legend';

/** 진검(날 있음) 또는 장식용(날 없음) */
export type EdgeKind = 'sharp' | 'blunt';

export interface SwordArt {
  blade: {
    /** mm */
    length: number;
    /** 날 밑동 너비, mm */
    width: number;
    /** 휘어짐(sori), mm. 0이면 직검 */
    curve: number;
    edge: 'single' | 'double';
    tip: 'kissaki' | 'spear' | 'round' | 'sickle';
    fuller?: boolean;
    ridge?: boolean;
    hamon?: boolean;
    inscription?: 'stars' | 'runes';
  };
  collar?: { color: string };
  guard: {
    type: 'disc' | 'cross' | 'quillon' | 'jian' | 'block' | 'none';
    width: number;
    color: string;
    accent?: string;
  };
  grip: {
    length: number;
    color: string;
    wrap: 'diamond' | 'cord' | 'wire' | 'leather' | 'ribbed';
    wrapColor?: string;
  };
  pommel: {
    type: 'cap' | 'wheel' | 'lobed' | 'ball' | 'ring' | 'jian' | 'gem';
    color: string;
    gem?: string;
  };
  tassel?: string;
}

export interface SwordStory {
  /** 연도나 시기 표기, 예: "1598" 또는 "6세기" */
  when: string;
  text: string;
}

/** 쇼핑몰이 지원하는 언어 */
export type Locale = 'ko' | 'en';

/** 한국어 원문을 다른 언어로 옮긴 글. 이름은 nameEn을 씁니다. */
export interface SwordTranslation {
  summary: string;
  description: string;
  era: string;
  material: string;
  stories: SwordStory[];
}

export interface Sword {
  id: string;
  slug: string;
  name: string;
  nameOriginal: string;
  nameEn: string;
  category: SwordCategory;
  /** 제작·출고 국가. 관세 계산의 출발지 */
  origin: CountryCode;
  era: string;
  summary: string;
  description: string;
  stories: SwordStory[];
  specs: {
    bladeLength: number;
    totalLength: number;
    weight: number;
    material: string;
    edge: EdgeKind;
  };
  /** 원화 판매가 */
  price: number;
  stock: number;
  art: SwordArt;
  /** 언어별 번역. 없으면 한국어 원문을 보여 줍니다. */
  translations?: Partial<Record<Exclude<Locale, 'ko'>, SwordTranslation>>;
}

export interface CartLine {
  swordId: string;
  quantity: number;
}

export type OrderStatus = 'paid' | 'permit-review' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  swordId: string;
  name: string;
  origin: CountryCode;
  unitPrice: number;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  destination: CountryCode;
  customer: Customer;
  lines: OrderLine[];
  paymentMethod: 'card' | 'transfer';
  permitConfirmed: boolean;
  amounts: {
    goods: number;
    shipping: number;
    duty: number;
    vat: number;
    total: number;
  };
}

export interface CountryRule {
  code: CountryCode;
  name: string;
  currency: CurrencyCode;
  /** 관세율(0~1) */
  dutyRate: number;
  /** 부가세·소비세·GST율(0~1) */
  vatRate: number;
  /** 관세 면제 한도. 물품가격 기준, limitCurrency 단위 */
  dutyFreeLimit: number;
  /** 부가세 면제 한도. 물품가격 기준, limitCurrency 단위 */
  vatFreeLimit: number;
  limitCurrency: CurrencyCode;
  /** 특정 출발국에 다른 면세 한도를 적용할 때(예: 한국의 미국발 200달러) */
  originLimits?: Partial<Record<CountryCode, number>>;
  /** 과세가격 기준. CIF는 물품가격+운임, FOB는 물품가격만 */
  valuation: 'CIF' | 'FOB';
  /** 수입·소지 관련 안내 */
  permitNote: string;
  /** 영어 안내. 없으면 한국어 안내를 씁니다. */
  permitNoteEn?: string;
}

export interface CustomsConfig {
  /** 1 단위 외화당 원화 */
  exchangeRates: Record<CurrencyCode, number>;
  /** 출고지 한 곳당 배송비(원) */
  shipping: { domestic: number; international: number };
  countries: CountryRule[];
  updatedAt: string;
}

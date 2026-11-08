/** ISO 3166-1 alpha-2 국가 코드 중 이 쇼핑몰에서 쓰는 것 */
export type CountryCode =
  | 'KR'
  | 'JP'
  | 'CN'
  | 'US'
  | 'GB'
  | 'DE'
  | 'FR'
  | 'IT'
  | 'NO'
  | 'GR'
  | 'AU'
  | 'CA'
  | 'IN'
  | 'ID'
  | 'NP'
  | 'PH'
  | 'TR'
  | 'IR'
  | 'EG'
  | 'ET'
  | 'SD'
  | 'YE'
  | 'SA'
  | 'ES'
  | 'CH'
  | 'RU'
  | 'MX'
  | 'AT';

export type CurrencyCode = 'KRW' | 'USD' | 'JPY' | 'CNY' | 'GBP' | 'EUR' | 'AUD' | 'CAD';

/** 지역(나무위키 '고대~근세기 무기'의 구분을 따름). legend는 신화·전설 재현품 */
export type SwordCategory = 'east' | 'west' | 'middle' | 'americas' | 'legend';

/** 형태: 곧은 검, 휜 도, 양손검·대도, 단검, 특수(물결·갈고리·카타르 등), 연습용(가검) */
export type SwordKind = 'straight' | 'curved' | 'great' | 'dagger' | 'exotic' | 'training';

/** 진검(날 있음) 또는 장식용(날 없음) */
export type EdgeKind = 'sharp' | 'blunt';

export interface SwordArt {
  blade: {
    /** mm */
    length: number;
    /** 날 밑동 너비, mm */
    width: number;
    /** 휘어짐(sori), mm. 0이면 직검, 음수면 날 쪽으로 휨(쿠크리·팔카타) */
    curve: number;
    edge: 'single' | 'double';
    /** kissaki 휜 칼끝, spear 뾰족, round 둥긂, sickle 낫, square 사각(처형검), clip 클립 포인트, hook 갈고리(구), needle 바늘(찌르기 검) */
    tip: 'kissaki' | 'spear' | 'round' | 'sickle' | 'square' | 'clip' | 'hook' | 'needle';
    fuller?: boolean;
    ridge?: boolean;
    hamon?: boolean;
    inscription?: 'stars' | 'runes';
    /** 물결 칼날의 진폭(mm). 크리스·플랑베르주·우르미 */
    wave?: number;
    /** 물결 수. 기본 7 */
    waves?: number;
    /** 칼끝 쪽 너비 배율(1보다 크면 넓어짐). 펄션·팔카타·대도 */
    flare?: number;
    /** 칼날 중간이 불룩한 정도(0~1). 비파형 동검 */
    bulge?: number;
    /** 칼날 재질. 기본 steel */
    material?: 'steel' | 'bronze' | 'wood' | 'bamboo' | 'foam';
    /** 재질 색을 바꿀 때(스펀지 검 등) */
    color?: string;
    /** 양쪽 날에 흑요석 조각을 박음(마쿠아후이틀) */
    teeth?: boolean;
    /** 칼날 밑동을 감싼 덧쇠(쌍수도의 구리 덧쇠). 리벳 네 개 */
    sleeve?: { length: number; color: string };
  };
  collar?: { color: string };
  guard: {
    /** dguard 손등 보호대, swept 스웹트 힐트, cup 컵 힐트, basket 바구니 힐트, katar 카타르 H자 틀, crescent 초승달(구), ring 총구 고리(대검), ganja 비대칭 받침(크리스) */
    type:
      | 'disc'
      | 'cross'
      | 'quillon'
      | 'jian'
      | 'block'
      | 'none'
      | 'dguard'
      | 'swept'
      | 'cup'
      | 'basket'
      | 'katar'
      | 'crescent'
      | 'ring'
      | 'ganja';
    width: number;
    color: string;
    accent?: string;
  };
  grip: {
    length: number;
    color: string;
    /** helix 촘촘한 나선 끈, plain 민무늬, split 둘로 나뉜 손잡이(발리송), katar 가로 손잡이(카타르) */
    wrap: 'diamond' | 'cord' | 'wire' | 'leather' | 'ribbed' | 'helix' | 'plain' | 'split' | 'katar';
    wrapColor?: string;
  };
  pommel: {
    /** none 없음, crook 굽은 지팡이 머리, beak 새부리(세이버), spike 뾰족한 끝(구) */
    type: 'cap' | 'wheel' | 'lobed' | 'ball' | 'ring' | 'jian' | 'gem' | 'none' | 'crook' | 'beak' | 'spike';
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
  kind: SwordKind;
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

import type { CatalogEntry, Pair, StoryRow } from './build';
import type { CountryCode, SwordArt, SwordKind } from '@snb/domain';

export const GOLD = '#b48a3c';
export const GOLD_LIGHT = '#d9b65a';
export const SILVER = '#9a9a96';
export const IRON = '#3a3532';
export const BRONZE = '#9c7a3c';
export const JADE = '#6f8f72';
export const RUBY = '#9a2a2a';
export const SAPPHIRE = '#2f5d9a';
export const EMERALD = '#2f7a5a';
export const AMBER = '#c27a1e';
export const AMETHYST = '#6a4a8a';
export const FLAME = '#b5552e';
export const ICE = '#9fc3d6';
export const NIGHT = '#2d2a33';

/** 전설의 출전 [한국어, 영어] */
export const SOURCE = {
  arthur: ['아서왕 전설', 'Arthurian legend'],
  norse: ['북유럽 신화', 'Norse mythology'],
  norseSaga: ['북유럽 전설', 'Norse saga'],
  charlemagne: ['샤를마뉴 전설', 'Matter of France'],
  celtic: ['켈트 신화', 'Celtic mythology'],
  dietrich: ['디트리히 전설', 'Dietrich legends'],
  beowulf: ['베오울프 전설', 'Beowulf'],
  english: ['영국 전설', 'English legend'],
  chinese: ['중국 전설', 'Chinese legend'],
  chineseMyth: ['중국 신화', 'Chinese mythology'],
  korean: ['한국 전설', 'Korean legend'],
  koreanMyth: ['한국 신화', 'Korean mythology'],
  japanese: ['일본 신화', 'Japanese mythology'],
  japaneseLegend: ['일본 전설', 'Japanese legend'],
  ainu: ['아이누 전설', 'Ainu legend'],
  water: ['수호전', 'Water Margin'],
  threeKingdoms: ['삼국지연의', 'Romance of the Three Kingdoms'],
  czech: ['체코 전설', 'Czech legend'],
  spanish: ['스페인 전설', 'Spanish legend'],
  christian: ['기독교 전설', 'Christian legend'],
} as const satisfies Record<string, Pair>;

const NOTE_KO = '전설 속 묘사를 바탕으로 상상해 만든 장식용 재현품이며, 날은 세우지 않았습니다.';
const NOTE_EN = 'An imagined display piece based on the legend’s descriptions, with no edge.';
const MATERIAL: Pair = [
  '스테인리스강(날 없음), 금도금 황동, 유리 보석',
  'Stainless steel (unsharpened), gilt brass, glass gems',
];

export interface LegendSpec {
  slug: string;
  name: readonly [ko: string, original: string, en: string];
  kind?: SwordKind;
  origin: CountryCode;
  source: Pair;
  summary: Pair;
  /** 재현품 안내 문구는 자동으로 붙습니다. */
  description: Pair;
  story: StoryRow;
  specs: readonly [blade: number, total: number, weight: number];
  price: number;
  stock?: number;
  material?: Pair;
  art: SwordArt;
}

/** 신화·전설 재현품: 분류는 legend, 날은 무딤, 설명 끝에 재현품 안내를 붙입니다. */
export function legend(spec: LegendSpec): CatalogEntry {
  return {
    slug: spec.slug,
    name: spec.name,
    category: 'legend',
    kind: spec.kind ?? 'straight',
    origin: spec.origin,
    era: spec.source,
    summary: spec.summary,
    description: [`${spec.description[0]} ${NOTE_KO}`, `${spec.description[1]} ${NOTE_EN}`],
    material: spec.material ?? MATERIAL,
    stories: [spec.story],
    specs: spec.specs,
    edge: 'blunt',
    price: spec.price,
    stock: spec.stock ?? 2,
    art: spec.art,
  };
}

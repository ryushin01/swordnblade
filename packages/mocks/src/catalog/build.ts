import type { CountryCode, EdgeKind, Sword, SwordArt, SwordCategory, SwordKind } from '@snb/domain';

/** [한국어, 영어] */
export type Pair = readonly [ko: string, en: string];

/** [언제(한국어), 언제(영어), 이야기(한국어), 이야기(영어)] */
export type StoryRow = readonly [whenKo: string, whenEn: string, ko: string, en: string];

/**
 * 도검 목록을 짧게 적는 형식. 한국어와 영어를 한 줄에 나란히 적고, buildCatalog가 Sword로 바꿉니다.
 * id는 slug에서 만들어(`sw-<slug>`) 순서를 바꿔도 저장된 데이터와 어긋나지 않습니다.
 */
export interface CatalogEntry {
  slug: string;
  /** [한국어 이름, 원어 표기, 영어 이름] */
  name: readonly [ko: string, original: string, en: string];
  category: SwordCategory;
  kind: SwordKind;
  origin: CountryCode;
  era: Pair;
  summary: Pair;
  description: Pair;
  material: Pair;
  stories: readonly StoryRow[];
  /** [칼날 길이 mm, 전체 길이 mm, 무게 g] */
  specs: readonly [blade: number, total: number, weight: number];
  edge: EdgeKind;
  price: number;
  stock: number;
  art: SwordArt;
}

export function buildCatalog(entries: readonly CatalogEntry[]): Sword[] {
  return entries.map((entry) => {
    const [name, nameOriginal, nameEn] = entry.name;
    const [bladeLength, totalLength, weight] = entry.specs;
    return {
      id: `sw-${entry.slug}`,
      slug: entry.slug,
      name,
      nameOriginal,
      nameEn,
      category: entry.category,
      kind: entry.kind,
      origin: entry.origin,
      era: entry.era[0],
      summary: entry.summary[0],
      description: entry.description[0],
      stories: entry.stories.map(([when, , text]) => ({ when, text })),
      specs: { bladeLength, totalLength, weight, material: entry.material[0], edge: entry.edge },
      price: entry.price,
      stock: entry.stock,
      art: entry.art,
      translations: {
        en: {
          era: entry.era[1],
          summary: entry.summary[1],
          description: entry.description[1],
          material: entry.material[1],
          stories: entry.stories.map(([, when, , text]) => ({ when, text })),
        },
      },
    };
  });
}

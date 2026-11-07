import { CATEGORY_LABEL, type Sword } from '@snb/domain';

export type SwordSort = 'recommended' | 'price-asc' | 'price-desc' | 'length-desc';

export const SORT_LABEL: Record<SwordSort, string> = {
  recommended: '추천순',
  'price-asc': '가격 낮은 순',
  'price-desc': '가격 높은 순',
  'length-desc': '길이 긴 순',
};

export const SWORD_SORTS = Object.keys(SORT_LABEL) as SwordSort[];

export const toSwordSort = (value: string | undefined): SwordSort =>
  SWORD_SORTS.includes(value as SwordSort) ? (value as SwordSort) : 'recommended';

/** 이름(한글·원어·영문), 시대, 분류 이름에서 찾고 정렬합니다. 대소문자와 띄어쓰기는 가리지 않습니다. */
export function filterSwords(swords: Sword[], options: { q?: string; sort?: SwordSort }): Sword[] {
  const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, '');
  const q = normalize(options.q ?? '');
  const matched = q
    ? swords.filter((sword) =>
        [sword.name, sword.nameOriginal, sword.nameEn, sword.era, CATEGORY_LABEL[sword.category]].some((field) =>
          normalize(field).includes(q),
        ),
      )
    : swords;

  const sorted = [...matched];
  switch (options.sort ?? 'recommended') {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'length-desc':
      return sorted.sort((a, b) => b.specs.totalLength - a.specs.totalLength);
    case 'recommended':
      return sorted;
  }
}

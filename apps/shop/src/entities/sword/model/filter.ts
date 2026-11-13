import {
  CATEGORY_LABEL,
  CATEGORY_LABEL_EN,
  KIND_LABEL,
  KIND_LABEL_EN,
  normalizeSearchText,
  type Sword,
  SWORD_KINDS,
  type SwordKind,
} from '@snb/domain';

export type SwordSort = 'recommended' | 'price-asc' | 'price-desc' | 'length-desc';

/** 정렬 순서. 화면에 보이는 이름은 messages의 Home.sort에 있습니다. */
export const SWORD_SORTS: SwordSort[] = ['recommended', 'price-asc', 'price-desc', 'length-desc'];

export const toSwordSort = (value: string | undefined): SwordSort =>
  SWORD_SORTS.includes(value as SwordSort) ? (value as SwordSort) : 'recommended';

/** 모르는 형태 값은 거르지 않음(undefined)으로 봅니다. */
export const toSwordKind = (value: string | undefined): SwordKind | undefined =>
  SWORD_KINDS.includes(value as SwordKind) ? (value as SwordKind) : undefined;

/** 한 쪽에 보여 줄 도검 수 */
const PAGE_SIZE = 24;

/** 주소의 쪽 번호(1부터). 숫자가 아니거나 1보다 작으면 1쪽 */
export const toPage = (value: string | undefined): number => {
  const page = Number.parseInt(value ?? '', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

/** 목록을 쪽으로 나눕니다. 쪽 번호가 마지막 쪽을 넘으면 마지막 쪽을 돌려줍니다. */
export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    total: items.length,
    page: current,
    pages,
    from: start + 1,
    to: Math.min(start + size, items.length),
  };
}

/**
 * 형태로 거르고, 이름(한글·원어·영문), 시대, 분류·형태 이름(한·영)에서 찾아 정렬합니다. 대소문자와 띄어쓰기는 가리지 않습니다.
 * 화면 언어로 바꾼 도검을 넘기면 그 언어의 시대 표기로도 찾습니다.
 */
export function filterSwords(swords: Sword[], options: { q?: string; sort?: SwordSort; kind?: SwordKind }): Sword[] {
  const normalize = normalizeSearchText;
  const q = normalize(options.q ?? '');
  const byKind = options.kind ? swords.filter((sword) => sword.kind === options.kind) : swords;
  const matched = q
    ? byKind.filter((sword) =>
        [
          sword.name,
          sword.nameOriginal,
          sword.nameEn,
          sword.era,
          CATEGORY_LABEL[sword.category],
          CATEGORY_LABEL_EN[sword.category],
          KIND_LABEL[sword.kind],
          KIND_LABEL_EN[sword.kind],
        ].some((field) => normalize(field).includes(q)),
      )
    : byKind;

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

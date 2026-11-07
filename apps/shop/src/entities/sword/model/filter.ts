import { CATEGORY_LABEL, CATEGORY_LABEL_EN, type Sword } from '@snb/domain';

export type SwordSort = 'recommended' | 'price-asc' | 'price-desc' | 'length-desc';

/** 정렬 순서. 화면에 보이는 이름은 messages의 Home.sort에 있습니다. */
export const SWORD_SORTS: SwordSort[] = ['recommended', 'price-asc', 'price-desc', 'length-desc'];

export const toSwordSort = (value: string | undefined): SwordSort =>
  SWORD_SORTS.includes(value as SwordSort) ? (value as SwordSort) : 'recommended';

/**
 * 이름(한글·원어·영문), 시대, 분류 이름(한·영)에서 찾고 정렬합니다. 대소문자와 띄어쓰기는 가리지 않습니다.
 * 화면 언어로 바꾼 도검을 넘기면 그 언어의 시대 표기로도 찾습니다.
 */
export function filterSwords(swords: Sword[], options: { q?: string; sort?: SwordSort }): Sword[] {
  // 맥 등에서 입력한 한글은 자모가 나뉜 NFD로 올 수 있어 NFC로 맞춘 뒤 비교합니다.
  const normalize = (text: string) => text.normalize('NFC').toLowerCase().replace(/\s+/g, '');
  const q = normalize(options.q ?? '');
  const matched = q
    ? swords.filter((sword) =>
        [
          sword.name,
          sword.nameOriginal,
          sword.nameEn,
          sword.era,
          CATEGORY_LABEL[sword.category],
          CATEGORY_LABEL_EN[sword.category],
        ].some((field) => normalize(field).includes(q)),
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

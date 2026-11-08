import { SEED_SWORDS } from '@snb/mocks';

import { filterSwords, paginate, toPage, toSwordKind, toSwordSort } from './filter';

describe('filterSwords', () => {
  it('한글·영문·원어 이름으로 찾는다(대소문자, 띄어쓰기 무시)', () => {
    expect(filterSwords(SEED_SWORDS, { q: '쌍수' }).map((s) => s.slug)).toEqual(['ssangsudo']);
    expect(filterSwords(SEED_SWORDS, { q: 'EXCALIBUR' }).map((s) => s.slug)).toEqual(['excalibur']);
    expect(filterSwords(SEED_SWORDS, { q: '草薙' }).map((s) => s.slug)).toEqual(['kusanagi']);
    expect(filterSwords(SEED_SWORDS, { q: '바이킹소드' }).map((s) => s.slug)).toEqual(['viking-sword']);
  });

  it('자모가 나뉜(NFD) 한글 검색어도 찾는다', () => {
    expect(filterSwords(SEED_SWORDS, { q: '쌍수도'.normalize('NFD') }).map((s) => s.slug)).toEqual(['ssangsudo']);
  });

  it('분류 이름으로도 찾는다', () => {
    expect(filterSwords(SEED_SWORDS, { q: '신화·전설' })).toHaveLength(
      SEED_SWORDS.filter((s) => s.category === 'legend').length,
    );
  });

  it('가격·길이로 정렬하고, 원본 배열은 바꾸지 않는다', () => {
    const before = SEED_SWORDS.map((s) => s.id);
    const asc = filterSwords(SEED_SWORDS, { sort: 'price-asc' });
    expect(asc[0]?.price).toBe(Math.min(...SEED_SWORDS.map((s) => s.price)));
    expect(filterSwords(SEED_SWORDS, { sort: 'length-desc' })[0]?.specs.totalLength).toBe(
      Math.max(...SEED_SWORDS.map((s) => s.specs.totalLength)),
    );
    expect(SEED_SWORDS.map((s) => s.id)).toEqual(before);
  });

  it('모르는 정렬 값은 추천순으로 본다', () => {
    expect(toSwordSort('nope')).toBe('recommended');
    expect(toSwordSort('price-desc')).toBe('price-desc');
  });

  it('형태로 거르고, 형태 이름으로도 찾는다', () => {
    const daggers = filterSwords(SEED_SWORDS, { kind: 'dagger' });
    expect(daggers.length).toBeGreaterThan(0);
    expect(daggers.every((s) => s.kind === 'dagger')).toBe(true);
    expect(filterSwords(SEED_SWORDS, { q: '연습용' }).every((s) => s.kind === 'training')).toBe(true);
    expect(toSwordKind('nope')).toBeUndefined();
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 50 }, (_, i) => i);

  it('24개씩 나누고 몇 번째부터 몇 번째인지 알려 준다', () => {
    expect(paginate(items, 1)).toMatchObject({ page: 1, pages: 3, from: 1, to: 24 });
    expect(paginate(items, 3)).toMatchObject({ items: [48, 49], page: 3, from: 49, to: 50 });
  });

  it('범위를 벗어난 쪽은 마지막 쪽으로, 잘못된 값은 1쪽으로 본다', () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate([], 2)).toMatchObject({ page: 1, pages: 1, items: [] });
    expect(toPage('abc')).toBe(1);
    expect(toPage('-3')).toBe(1);
    expect(toPage('2')).toBe(2);
  });
});

import { SEED_SWORDS } from '@snb/mocks';

import { filterSwords, toSwordSort } from './filter';

describe('filterSwords', () => {
  it('한글·영문·원어 이름으로 찾는다(대소문자, 띄어쓰기 무시)', () => {
    expect(filterSwords(SEED_SWORDS, { q: '쌍수' }).map((s) => s.slug)).toEqual(['ssangsudo']);
    expect(filterSwords(SEED_SWORDS, { q: 'EXCALIBUR' }).map((s) => s.slug)).toEqual(['excalibur']);
    expect(filterSwords(SEED_SWORDS, { q: '草薙' }).map((s) => s.slug)).toEqual(['kusanagi']);
    expect(filterSwords(SEED_SWORDS, { q: '바이킹소드' }).map((s) => s.slug)).toEqual(['viking-sword']);
  });

  it('분류 이름으로도 찾는다', () => {
    expect(filterSwords(SEED_SWORDS, { q: '신화' })).toHaveLength(5);
  });

  it('가격·길이로 정렬하고, 원본 배열은 바꾸지 않는다', () => {
    const before = SEED_SWORDS.map((s) => s.id);
    const asc = filterSwords(SEED_SWORDS, { sort: 'price-asc' });
    expect(asc[0]?.price).toBe(Math.min(...SEED_SWORDS.map((s) => s.price)));
    expect(filterSwords(SEED_SWORDS, { sort: 'length-desc' })[0]?.slug).toBe('claymore');
    expect(SEED_SWORDS.map((s) => s.id)).toEqual(before);
  });

  it('모르는 정렬 값은 추천순으로 본다', () => {
    expect(toSwordSort('nope')).toBe('recommended');
    expect(toSwordSort('price-desc')).toBe('price-desc');
  });
});

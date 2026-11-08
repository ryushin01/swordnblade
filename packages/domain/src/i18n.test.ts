import { describe, expect, it } from 'vitest';

import { DEFAULT_CUSTOMS_CONFIG } from './constants';
import { formatKRW } from './format';
import { countryName, localizeSword, permitNote } from './i18n';

import type { Sword } from './types';

const base: Sword = {
  id: 'x',
  slug: 'x',
  name: '환도',
  nameOriginal: '環刀',
  nameEn: 'Hwando',
  category: 'east',
  kind: 'curved',
  origin: 'KR',
  era: '조선',
  summary: '요약',
  description: '설명',
  stories: [{ when: '15세기', text: '이야기' }],
  specs: { bladeLength: 680, totalLength: 870, weight: 1050, material: '강철', edge: 'sharp' },
  price: 1,
  stock: 1,
  art: {} as Sword['art'],
};
const en = { summary: 'Summary', description: 'Desc', era: 'Joseon', material: 'Steel', stories: [] };

describe('localizeSword', () => {
  it('한국어는 그대로 둔다', () => {
    expect(localizeSword({ ...base, translations: { en } }, 'ko')).toEqual({ ...base, translations: { en } });
  });

  it('영어는 영문 이름과 번역을 쓴다', () => {
    const sword = localizeSword({ ...base, translations: { en } }, 'en');
    expect(sword).toMatchObject({ name: 'Hwando', summary: 'Summary', era: 'Joseon', stories: [] });
    expect(sword.specs.material).toBe('Steel');
  });

  it('번역이 없으면 fallback, 그것도 없으면 한국어 원문을 쓴다', () => {
    expect(localizeSword(base, 'en', en).summary).toBe('Summary');
    expect(localizeSword(base, 'en')).toMatchObject({ name: 'Hwando', summary: '요약' });
  });
});

describe('언어별 표시', () => {
  it('원화 금액과 국가 이름, 허가 안내', () => {
    expect(formatKRW(1234000)).toBe('1,234,000원');
    expect(formatKRW(1234000, 'en')).toBe('₩1,234,000');
    expect(countryName('KR', 'en')).toBe('South Korea');
    const kr = DEFAULT_CUSTOMS_CONFIG.countries[0]!;
    expect(permitNote({ ...kr, permitNoteEn: undefined }, 'en')).toBe(kr.permitNote);
  });
});

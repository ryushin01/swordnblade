import { describe, expect, it } from 'vitest';

import { SEED_SWORDS } from '../seed';

describe('시드 도검 목록', () => {
  it('id, 주소(slug), 이름이 겹치지 않는다', () => {
    for (const key of ['id', 'slug', 'name', 'nameEn'] as const) {
      const values = SEED_SWORDS.map((sword) => sword[key]);
      const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
      expect(duplicates, key).toEqual([]);
    }
  });

  it('역사 도검 101점과 신화·전설 112점이 있다', () => {
    expect(SEED_SWORDS.filter((sword) => sword.category !== 'legend')).toHaveLength(101);
    expect(SEED_SWORDS.filter((sword) => sword.category === 'legend')).toHaveLength(112);
  });

  it('모든 도검에 영어 글이 있고, 제원과 그림의 칼날 길이가 같다', () => {
    for (const sword of SEED_SWORDS) {
      expect(sword.translations?.en?.summary, sword.slug).toBeTruthy();
      expect(sword.specs.totalLength, sword.slug).toBeGreaterThan(sword.specs.bladeLength);
      expect(sword.art.blade.length, sword.slug).toBe(sword.specs.bladeLength);
    }
  });

  it('신화·전설 재현품은 날을 세우지 않는다', () => {
    expect(SEED_SWORDS.filter((sword) => sword.category === 'legend' && sword.specs.edge === 'sharp')).toEqual([]);
  });
});

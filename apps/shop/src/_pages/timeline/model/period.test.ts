import { SEED_SWORDS } from '@snb/mocks';

import { earliestYear, periodOf } from './period';

describe('periodOf', () => {
  it.each([
    ['고대 이집트 · 기원전 2천년기', 'bc2000'],
    ['고조선 · 기원전 10~4세기', 'bc1000'],
    ['다키아 · 기원전 1세기~2세기', 'bc1000'],
    ['삼국시대 · 4~6세기', 'ad1'],
    ['일본 · 헤이안~에도', 'ad500'],
    ['유럽 · 11~16세기', 'ad1000'],
    ['조선 후기 · 18세기', 'ad1700'],
    ['일본 · 메이지~1934', 'ad1700'],
    ['일본 · 1941~1945', 'ad1900'],
    ['오늘 · 역사 검술 연습', 'ad1900'],
    ['아라비아 · 전통', 'unknown'],
  ])('%s → %s', (era, expected) => {
    expect(periodOf(era)).toBe(expected);
  });

  it('시기 미상은 몇 점 안 된다', () => {
    const unknown = SEED_SWORDS.filter((s) => s.category !== 'legend' && earliestYear(s.era) === null);
    expect(unknown.length).toBeLessThanOrEqual(8);
  });
});

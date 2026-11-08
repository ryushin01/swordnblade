import { SEED_SWORDS } from '@snb/mocks';

import { buildSitemap } from './sitemap';

describe('buildSitemap', () => {
  it('홈, 비교, 연표, 모든 도검을 두 언어로 싣는다', () => {
    const entries = buildSitemap();
    expect(entries).toHaveLength((SEED_SWORDS.length + 3) * 2);
    expect(entries.map((entry) => entry.url)).toContain('https://swordnblade.vercel.app/en/swords/ssangsudo');
    expect(entries[0]?.alternates?.languages).toHaveProperty('en');
  });
});

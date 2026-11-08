import { SEED_SWORDS } from '@snb/mocks';

import { localizeForLocale } from './localize';

const seed = SEED_SWORDS[0]!;

describe('localizeForLocale', () => {
  it('번역 속성이 없는 예전 데이터는 시드 번역을 쓴다', () => {
    const legacy = { ...seed };
    delete legacy.translations;
    expect(localizeForLocale(legacy, 'en').summary).toBe(seed.translations?.en?.summary);
  });

  it('어드민에서 영어 글을 비운 도검(빈 translations)은 한국어 원문을 쓴다', () => {
    const cleared = { ...seed, translations: {} };
    const sword = localizeForLocale(cleared, 'en');
    expect(sword.name).toBe('Ssangsudo');
    expect(sword.summary).toBe(seed.summary);
  });
});

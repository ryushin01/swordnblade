import { SEED_SWORDS } from '@snb/mocks';

import { normalizeArt, normalizeStories, normalizeTranslation } from './normalize-art';

const ssangsudo = SEED_SWORDS[0]!.art;

describe('normalizeArt', () => {
  it('비운 칼날 고리·술은 속성을 없앤다', () => {
    const art = normalizeArt({ ...ssangsudo, collar: { color: undefined as unknown as string }, tassel: undefined });
    expect(art).not.toHaveProperty('collar');
    expect(art).not.toHaveProperty('tassel');
  });

  it('보석 박힘이 아닌 끝장식의 보석 색은 버린다', () => {
    const art = normalizeArt({ ...ssangsudo, pommel: { type: 'cap', color: '#000000', gem: '#ff0000' } });
    expect(art.pommel).toEqual({ type: 'cap', color: '#000000' });
  });

  it('비운 코등이 장식 색은 속성을 없앤다', () => {
    const art = normalizeArt({ ...ssangsudo, guard: { ...ssangsudo.guard, accent: undefined } });
    expect(art.guard).not.toHaveProperty('accent');
    expect(normalizeArt(ssangsudo).guard.accent).toBe(ssangsudo.guard.accent);
  });

  it('칼날 길이를 제원과 맞춘다', () => {
    expect(normalizeArt(ssangsudo, 1000).blade.length).toBe(1000);
  });

  it('상감을 비우면 속성을 없앤다', () => {
    const art = normalizeArt({ ...ssangsudo, blade: { ...ssangsudo.blade, inscription: undefined } });
    expect(art.blade).not.toHaveProperty('inscription');
  });
});

describe('normalizeStories', () => {
  it('내용이 빈 줄은 버리고 공백을 지운다', () => {
    expect(
      normalizeStories([{ when: ' 1790 ', text: ' 기록 ' }, { when: '', text: '' }, { when: '오늘', text: ' ' }, {}]),
    ).toEqual([{ when: '1790', text: '기록' }]);
  });
});

describe('normalizeTranslation', () => {
  it('칸을 모두 비우면 번역을 지운다', () => {
    expect(
      normalizeTranslation({ summary: ' ', description: '', era: '', material: '', stories: [{}] }),
    ).toBeUndefined();
    expect(normalizeTranslation(undefined)).toBeUndefined();
  });

  it('공백을 지우고 내용이 빈 이야기는 버린다', () => {
    expect(
      normalizeTranslation({
        summary: ' A sword ',
        description: 'Desc',
        era: 'Joseon',
        material: 'Steel',
        stories: [
          { when: 'Today', text: ' Forged ' },
          { when: 'Myth', text: '' },
        ],
      }),
    ).toEqual({
      summary: 'A sword',
      description: 'Desc',
      era: 'Joseon',
      material: 'Steel',
      stories: [{ when: 'Today', text: 'Forged' }],
    });
  });
});

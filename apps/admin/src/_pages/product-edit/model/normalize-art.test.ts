import { SEED_SWORDS } from '@snb/mocks';

import {
  mergeArt,
  normalizeArt,
  normalizeDiscount,
  normalizeImages,
  normalizeStories,
  normalizeTranslation,
} from './normalize-art';

import type { SwordArt } from '@snb/domain';

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

describe('normalizeImages', () => {
  it('주소 없는 줄은 버리고 대체 텍스트를 다듬는다', () => {
    expect(
      normalizeImages([
        { url: '/api/images/a', alt: ' 칼날 ', altEn: ' ' },
        { url: '', alt: 'x' },
        { url: '/api/images/b', alt: '손잡이', altEn: ' Grip ' },
      ]),
    ).toEqual([
      { url: '/api/images/a', alt: '칼날' },
      { url: '/api/images/b', alt: '손잡이', altEn: 'Grip' },
    ]);
  });
});

describe('mergeArt', () => {
  const saved = {
    blade: {
      length: 900,
      width: 36,
      curve: 20,
      edge: 'single',
      tip: 'kissaki',
      sleeve: { length: 190, color: '#b8734f' },
    },
    guard: { type: 'plate', width: 72, color: '#d4af57' },
    grip: { length: 330, color: '#5a1410', wrap: 'helix', ferrule: { length: 24, color: '#d4af57' } },
    pommel: { type: 'cap', color: '#d4af57' },
  } as SwordArt;

  it('폼에 칸이 없는 값은 지키고, 폼에서 고친 값은 반영한다', () => {
    const form = {
      blade: { length: 950, width: 36, curve: 20, edge: 'single', tip: 'kissaki' },
      guard: { type: 'plate', width: 80, color: '#d4af57' },
      grip: { length: 330, color: '#5a1410', wrap: 'helix' },
      pommel: { type: 'cap', color: '#d4af57' },
    } as SwordArt;
    const merged = mergeArt(saved, form);
    expect(merged.blade.sleeve).toEqual(saved.blade.sleeve);
    expect(merged.grip.ferrule).toEqual(saved.grip.ferrule);
    expect(merged.blade.length).toBe(950);
    expect(merged.guard.width).toBe(80);
  });

  it('새 상품은 폼 값을 그대로 쓴다', () => {
    expect(mergeArt(undefined, saved)).toBe(saved);
  });

  it('다른 도검을 본뜬 뒤에는 그 도검의 그림을 기준으로 해, 원래 덧쇠가 남지 않는다', () => {
    const template = { ...saved, blade: { ...saved.blade }, grip: { ...saved.grip } } as SwordArt;
    delete template.blade.sleeve;
    delete template.grip.ferrule;
    const merged = mergeArt(template, template);
    expect(merged.blade.sleeve).toBeUndefined();
    expect(merged.grip.ferrule).toBeUndefined();
  });
});

describe('normalizeDiscount', () => {
  it('할인율을 비우면 기간이 남아 있어도 할인을 없앤다', () => {
    expect(normalizeDiscount({ rate: null, startsAt: '2027-01-01', endsAt: '' })).toBeUndefined();
    expect(normalizeDiscount(undefined)).toBeUndefined();
  });

  it('비운 날짜는 속성을 없애 기한 없이 둔다', () => {
    expect(normalizeDiscount({ rate: 15, startsAt: '', endsAt: '2027-06-30' })).toEqual({
      rate: 15,
      endsAt: '2027-06-30',
    });
    expect(normalizeDiscount({ rate: 10, startsAt: null, endsAt: undefined })).toEqual({ rate: 10 });
  });
});

import { relatedSwords } from './related';

const make = (id: string, category: 'east' | 'west', kind: 'curved' | 'dagger') => ({ id, category, kind });

describe('relatedSwords', () => {
  const all = [
    make('me', 'east', 'curved'),
    make('other-kind', 'east', 'dagger'),
    make('west', 'west', 'curved'),
    make('same', 'east', 'curved'),
  ];

  it('같은 형태를 앞에 두고, 자기 자신과 다른 지역은 뺀다', () => {
    expect(relatedSwords(all[0]!, all).map((s) => s.id)).toEqual(['same', 'other-kind']);
  });

  it('개수를 제한한다', () => {
    expect(relatedSwords(all[0]!, all, 1).map((s) => s.id)).toEqual(['same']);
  });
});

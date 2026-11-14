import { describe, expect, it } from 'vitest';

import { motionConfig, reducedConfig, selectConfig } from './config';

type Rule = { on?: string; from?: string[]; to?: string[]; priority?: number };

describe('화면 전환 설정', () => {
  it('동작 줄이기를 켜면 전환이 없는 설정을 쓴다', () => {
    expect(selectConfig(true)).toBe(reducedConfig);
    expect(reducedConfig.transitions).toEqual([]);
    expect(selectConfig(false)).toBe(motionConfig);
  });

  it('도검 벽과 상세에서 상세로 갈 때는 hero, 나머지는 fade', () => {
    const rules = motionConfig.transitions as unknown as Rule[];
    expect(rules[0]).toMatchObject({ on: '/**', priority: -100 });
    expect(rules[1]).toMatchObject({
      from: ['/', '/swords/*', '/en', '/en/swords/*'],
      to: ['/swords/*', '/en/swords/*'],
    });
  });

  it('언어 접두어를 떼는 middleware를 쓰지 않는다(언어를 바꿀 때 떠나는 화면이 남지 않게)', () => {
    expect(motionConfig.middleware).toBeUndefined();
  });
});

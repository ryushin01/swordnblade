import { describe, expect, it } from 'vitest';

import { motionConfig, reducedConfig, selectConfig } from './config';

type Rule = { on?: string; from?: string | string[]; to?: string | string[]; priority?: number };
const rulesOf = (config: typeof motionConfig) => config.transitions as unknown as Rule[];

describe('화면 전환 설정', () => {
  it('동작 줄이기를 켜면 줄인 설정을 쓰고, 같은 설정 객체를 돌려준다(엔진을 다시 만들지 않게)', () => {
    expect(selectConfig(true)).toBe(reducedConfig);
    expect(selectConfig(false)).toBe(motionConfig);
    expect(selectConfig(true)).toBe(selectConfig(true));
  });

  it('도검의 벽과 상세에서 상세로 갈 때는 hero, 나머지는 쌍 규칙의 fade', () => {
    const rules = rulesOf(motionConfig);
    expect(rules[0]).toMatchObject({ from: '/**', to: '/**', priority: -100 });
    expect(rules[1]).toMatchObject({
      from: ['/', '/swords/*', '/en', '/en/swords/*'],
      to: ['/swords/*', '/en/swords/*'],
    });
  });

  it('나머지 이동을 on 규칙으로 두지 않는다(뒤로 가도 보던 자리를 잃음)', () => {
    expect(rulesOf(motionConfig).some((rule) => rule.on !== undefined)).toBe(false);
  });

  it('동작 줄이기에서도 규칙을 비우지 않는다(맞는 규칙이 없으면 뒤로 가도 맨 위로 감)', () => {
    expect(rulesOf(reducedConfig).map(({ from, to, priority }) => ({ from, to, priority }))).toEqual(
      rulesOf(motionConfig).map(({ from, to, priority }) => ({ from, to, priority })),
    );
  });

  it('언어 접두어를 떼는 middleware를 쓰지 않는다(언어를 바꿀 때 떠나는 화면이 남지 않게)', () => {
    expect(motionConfig.middleware).toBeUndefined();
    expect(reducedConfig.middleware).toBeUndefined();
  });
});

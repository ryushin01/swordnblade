import { describe, expect, it } from 'vitest';

import { SEED_SWORDS } from '@snb/mocks';

import { bladeOutline, CATALOG_SIDE, hiltLayout, localBounds, squareViewBox } from './geometry';

describe('sword geometry', () => {
  it('모든 시드 도검의 viewBox가 유한한 정사각형이다', () => {
    for (const sword of SEED_SWORDS) {
      const [, , w, h] = squareViewBox(sword.art, 'fit').split(' ').map(Number);
      expect(Number.isFinite(w)).toBe(true);
      expect(w).toBe(h);
    }
  });

  it('카탈로그 축척에서는 짧은 칼도 같은 크기의 틀에 그린다', () => {
    const short = SEED_SWORDS.find((s) => s.slug === 'wakizashi')!;
    const [, , side] = squareViewBox(short.art, 'catalog').split(' ').map(Number);
    expect(side).toBeGreaterThanOrEqual(CATALOG_SIDE);
  });

  it('칼날 외곽선은 칼끝(-length)까지 닿는다', () => {
    const katana = SEED_SWORDS.find((s) => s.slug === 'uchigatana')!;
    const outline = bladeOutline(katana.art);
    expect(Math.min(...outline.map((p) => p.y))).toBeCloseTo(-katana.art.blade.length);
    expect(outline.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
  });

  it('손잡이는 코등이 아래에서 시작해 끝장식으로 끝난다', () => {
    const ssangsudo = SEED_SWORDS[0]!;
    const layout = hiltLayout(ssangsudo.art);
    expect(layout.gripEnd - layout.gripStart).toBe(ssangsudo.art.grip.length);
    expect(localBounds(ssangsudo.art).maxY).toBeGreaterThan(layout.pommelEnd);
  });
});

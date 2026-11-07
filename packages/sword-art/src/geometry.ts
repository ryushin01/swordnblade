import type { SwordArt } from '@snb/domain';

/**
 * 좌표계: 단위 mm, 칼날 밑동이 y=0, 칼끝은 y=-length(위쪽), 손잡이는 +y(아래쪽).
 * 등(spine)은 -x 쪽, 날(edge)은 +x 쪽입니다.
 */
export interface Point {
  x: number;
  y: number;
}

const SAMPLES = 64;

export const pointsToPath = (points: Point[], close = true): string =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + (close ? ' Z' : '');

export function bladeCenterX(art: SwordArt, t: number): number {
  return -art.blade.curve * t * t;
}

/** 칼날 너비(끝으로 갈수록 가늘어지는 distal taper 포함) */
export function bladeWidthAt(art: SwordArt, t: number): number {
  return art.blade.width * (1 - 0.3 * t);
}

export function tipLength(art: SwordArt): number {
  const { width, tip } = art.blade;
  switch (tip) {
    case 'kissaki':
      return width * 1.4;
    case 'spear':
      return width * 1.7;
    case 'round':
      return width * 0.6;
    case 'sickle':
      return width * 1.2;
  }
}

/** 칼날 외곽선. 등 쪽을 밑동→끝, 날 쪽을 끝→밑동 순서로 돌려줍니다. */
export function bladeOutline(art: SwordArt): Point[] {
  const { length, edge, tip } = art.blade;
  const tipStart = 1 - tipLength(art) / length;
  const spine: Point[] = [];
  const edgeSide: Point[] = [];

  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES;
    const y = -t * length;
    const cx = bladeCenterX(art, t);
    const w = bladeWidthAt(art, t);
    const u = t <= tipStart ? 0 : (t - tipStart) / (1 - tipStart);

    if (edge === 'single') {
      const spineX = cx - w / 2;
      if (u === 0) {
        spine.push({ x: spineX, y });
        edgeSide.push({ x: spineX + w, y });
      } else {
        const curveIn = tip === 'kissaki' ? Math.sqrt(Math.max(0, 1 - u * u)) : 1 - u;
        spine.push({ x: spineX + w * 0.12 * u * u, y });
        edgeSide.push({ x: spineX + w * 0.12 * u * u + (w - w * 0.12 * u * u) * curveIn, y });
      }
    } else {
      let half = w / 2;
      if (u > 0) {
        if (tip === 'round') half *= Math.sqrt(Math.max(0, 1 - u * u));
        else half *= Math.pow(1 - u, 0.85);
      }
      spine.push({ x: cx - half, y });
      edgeSide.push({ x: cx + half, y });
    }
  }

  return [...spine, ...edgeSide.reverse()];
}

/** 하르페(낫 모양 칼)의 갈고리 */
export function sickleHookPath(art: SwordArt): string {
  const { length, width } = art.blade;
  const t0 = 0.62;
  const y0 = -t0 * length;
  const x0 = bladeCenterX(art, t0) + bladeWidthAt(art, t0) / 2 - 2;
  const reach = width * 2.3;
  return [
    `M${x0} ${y0}`,
    `C${x0 + reach * 0.6} ${y0 - width * 0.9} ${x0 + reach * 1.05} ${y0 - width * 0.1} ${x0 + reach} ${y0 + width * 1.3}`,
    `C${x0 + reach * 0.82} ${y0 + width * 0.45} ${x0 + reach * 0.45} ${y0 - width * 0.05} ${x0} ${y0 + width * 0.55}`,
    'Z',
  ].join(' ');
}

/** 칼날 위 띠(홈·문양) 폴리곤: from~to 구간, 등에서 offset 비율 위치, 너비 비율 */
export function bladeStrip(art: SwordArt, from: number, to: number, offsetRatio: number, widthRatio: number): Point[] {
  const left: Point[] = [];
  const right: Point[] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i += 1) {
    const t = from + ((to - from) * i) / steps;
    const y = -t * art.blade.length;
    const w = bladeWidthAt(art, t);
    const base = bladeCenterX(art, t) - w / 2 + w * offsetRatio;
    // 끝으로 갈수록 뾰족하게 마무리
    const end = i === steps ? 0.15 : i === 0 ? 0.6 : 1;
    const half = (w * widthRatio * end) / 2;
    left.push({ x: base - half, y });
    right.push({ x: base + half, y });
  }
  return [...left, ...right.reverse()];
}

/** 날 쪽을 따라가는 물결 모양 선(하몬) */
export function hamonPath(art: SwordArt): string {
  const tipStart = 1 - tipLength(art) / art.blade.length;
  const points: Point[] = [];
  const steps = 90;
  for (let i = 0; i <= steps; i += 1) {
    const t = 0.01 + ((tipStart - 0.01) * i) / steps;
    const w = bladeWidthAt(art, t);
    const wave = Math.sin(i * 0.9) * 0.06 + Math.sin(i * 0.37) * 0.04;
    points.push({ x: bladeCenterX(art, t) - w / 2 + w * (0.66 + wave), y: -t * art.blade.length });
  }
  return pointsToPath(points, false);
}

export interface HiltLayout {
  collarHeight: number;
  guardThickness: number;
  gripStart: number;
  gripEnd: number;
  gripWidth: number;
  pommelEnd: number;
}

export function guardThickness(art: SwordArt): number {
  switch (art.guard.type) {
    case 'disc':
      return Math.max(14, art.guard.width * 0.22);
    case 'cross':
    case 'quillon':
      return 18;
    case 'jian':
      return 30;
    case 'block':
      return 30;
    case 'none':
      return 0;
  }
}

export function pommelHeight(art: SwordArt): number {
  switch (art.pommel.type) {
    case 'cap':
      return 20;
    case 'wheel':
    case 'gem':
      return 56;
    case 'lobed':
      return 34;
    case 'ball':
      return 42;
    case 'ring':
      return 60;
    case 'jian':
      return 34;
  }
}

export function hiltLayout(art: SwordArt): HiltLayout {
  const guard = guardThickness(art);
  const gripStart = guard;
  const gripEnd = gripStart + art.grip.length;
  const twoHanded = art.grip.length >= 220;
  return {
    collarHeight: art.collar ? Math.max(22, art.blade.width * 0.8) : 0,
    guardThickness: guard,
    gripStart,
    gripEnd,
    gripWidth: twoHanded ? 34 : 30,
    pommelEnd: gripEnd + pommelHeight(art),
  };
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 회전 전 좌표계에서의 외곽 범위 */
export function localBounds(art: SwordArt): Bounds {
  const layout = hiltLayout(art);
  const halfBlade = art.blade.width / 2 + Math.abs(art.blade.curve);
  const hook = art.blade.tip === 'sickle' ? art.blade.width * 2.4 : 0;
  const halfGuard = art.guard.width / 2;
  const tassel = art.tassel ? 120 : 0;
  return {
    minX: -Math.max(halfBlade, halfGuard, 40),
    maxX: Math.max(halfBlade + hook, halfGuard, 40) + tassel * 0.7,
    minY: -art.blade.length - 4,
    maxY: layout.pommelEnd + tassel,
  };
}

export const ROTATION_DEG = 45;

export function rotatedBounds(bounds: Bounds, deg = ROTATION_DEG): Bounds {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners: Point[] = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.minX, y: bounds.maxY },
    { x: bounds.maxX, y: bounds.maxY },
  ];
  const rotated = corners.map((p) => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }));
  return {
    minX: Math.min(...rotated.map((p) => p.x)),
    maxX: Math.max(...rotated.map((p) => p.x)),
    minY: Math.min(...rotated.map((p) => p.y)),
    maxY: Math.max(...rotated.map((p) => p.y)),
  };
}

/**
 * 정사각 viewBox를 만듭니다.
 * - fit: 칼마다 꽉 차게
 * - catalog: 모든 칼을 같은 축척으로 그려 길이 차이가 보이게
 */
export function squareViewBox(art: SwordArt, frame: 'fit' | 'catalog', padding = 0.08): string {
  const b = rotatedBounds(localBounds(art));
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const fitSide = Math.max(b.maxX - b.minX, b.maxY - b.minY);
  const side = (frame === 'catalog' ? Math.max(fitSide, CATALOG_SIDE) : fitSide) * (1 + padding * 2);
  return `${(cx - side / 2).toFixed(1)} ${(cy - side / 2).toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`;
}

/** 카탈로그 축척: 전장 약 1.5m 칼이 꽉 차는 크기 */
export const CATALOG_SIDE = 1120;

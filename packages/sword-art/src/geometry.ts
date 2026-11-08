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

const smoothstep = (from: number, to: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - from) / (to - from)));
  return x * x * (3 - 2 * x);
};

/** 칼날 가운데 선. 휘어짐(음수면 날 쪽으로 휨)과 물결을 더합니다. 물결은 칼끝에서 잦아듭니다. */
export function bladeCenterX(art: SwordArt, t: number): number {
  const { curve, wave = 0, waves = 7 } = art.blade;
  const waveX = wave ? wave * Math.sin(t * waves * Math.PI * 2) * (1 - smoothstep(0.88, 1, t)) : 0;
  return -curve * t * t + waveX;
}

/** 칼날 너비: 끝으로 갈수록 가늘어지고(distal taper), 넓어짐(flare)·불룩함(bulge)을 반영합니다. */
export function bladeWidthAt(art: SwordArt, t: number): number {
  const { width, flare = 1, bulge = 0 } = art.blade;
  const taper = 1 - 0.3 * t;
  const flareFactor = 1 + (flare - 1) * smoothstep(0.15, 0.85, t);
  const bulgeFactor = 1 + bulge * Math.exp(-(((t - 0.35) / 0.14) ** 2));
  return width * taper * flareFactor * bulgeFactor;
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
    case 'square':
      return width * 0.06;
    case 'clip':
      return width * 1.8;
    case 'hook':
      return width * 1.4;
    case 'needle':
      return width * 4;
    case 'fork':
      return width * 1.1;
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
      } else if (tip === 'square') {
        spine.push({ x: spineX, y });
        edgeSide.push({ x: spineX + w, y });
      } else if (tip === 'clip') {
        // 등 쪽이 비스듬히 깎여 날 쪽으로 내려오는 클립 포인트
        const drop = w * 0.55 * u;
        spine.push({ x: spineX + drop, y });
        edgeSide.push({ x: spineX + drop + (w - drop) * Math.sqrt(Math.max(0, 1 - u * u)), y });
      } else {
        const curveIn = tip === 'kissaki' || tip === 'round' ? Math.sqrt(Math.max(0, 1 - u * u)) : Math.pow(1 - u, 0.9);
        spine.push({ x: spineX + w * 0.12 * u * u, y });
        edgeSide.push({ x: spineX + w * 0.12 * u * u + (w - w * 0.12 * u * u) * curveIn, y });
      }
    } else {
      let half = w / 2;
      if (u > 0 && tip !== 'square') {
        if (tip === 'fork') half *= 1 - 0.15 * u;
        else if (tip === 'round') half *= Math.sqrt(Math.max(0, 1 - u * u));
        else half *= Math.pow(1 - u, tip === 'needle' ? 0.95 : 0.85);
      }
      spine.push({ x: cx - half, y });
      edgeSide.push({ x: cx + half, y });
    }
  }

  if (tip === 'fork' && edge === 'double') {
    // 두 갈래 칼끝(줄피카르): 칼끝 가운데를 V자로 파 두 갈래로 나눕니다.
    const notch = { x: bladeCenterX(art, 1), y: -length + art.blade.width * 1.1 };
    return [...spine, notch, ...edgeSide.reverse()];
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

/** 구(호두구) 칼끝의 갈고리: 칼끝에서 등 쪽으로 말려 내려옵니다. 굵은 선으로 그립니다. */
export function hookTipPath(art: SwordArt): string {
  const { length, width } = art.blade;
  const x0 = bladeCenterX(art, 1);
  const y0 = -length;
  return `M${x0} ${y0 + width * 0.4} C${x0 - width * 0.4} ${y0 - width * 1.6} ${x0 - width * 2.6} ${y0 - width * 1.4} ${x0 - width * 2.4} ${y0 + width * 0.6}`;
}

/** 칼날 밑동을 감싼 덧쇠 폴리곤(0~to 구간, 칼날보다 조금 넓게) */
export function sleevePoints(art: SwordArt, sleeveLength: number): Point[] {
  const to = Math.min(0.6, sleeveLength / art.blade.length);
  const left: Point[] = [];
  const right: Point[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i += 1) {
    const t = (to * i) / steps;
    const y = -t * art.blade.length;
    const half = bladeWidthAt(art, t) * 0.56;
    const cx = bladeCenterX(art, t);
    left.push({ x: cx - half, y });
    right.push({ x: cx + half, y });
  }
  return [...left, ...right.reverse()];
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
    case 'dguard':
      return 18;
    case 'swept':
      return 20;
    case 'cup':
      return 26;
    case 'basket':
      return 22;
    case 'katar':
      return 12;
    case 'crescent':
      return 26;
    case 'ring':
      return 16;
    case 'ganja':
      return 24;
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
    case 'none':
      return 0;
    case 'crook':
      return 52;
    case 'beak':
      return 28;
    case 'spike':
      return 44;
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
    // 카타르는 두 옆 막대 사이를 손으로 쥐어 손잡이 폭이 넓습니다.
    gripWidth: art.grip.wrap === 'katar' ? 76 : twoHanded ? 34 : 30,
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
  const { blade, guard } = art;
  const maxWidth = blade.width * (blade.flare ?? 1) * (1 + (blade.bulge ?? 0));
  const halfBlade = maxWidth / 2 + Math.abs(blade.curve) + (blade.wave ?? 0) + (blade.teeth ? blade.width * 0.4 : 0);
  const sickle = blade.tip === 'sickle' ? blade.width * 2.4 : 0;
  const hook = blade.tip === 'hook' ? blade.width * 2.8 : 0;
  // 손등 보호대·바구니는 손잡이 옆(날 쪽)으로 나옵니다.
  const bow = ['dguard', 'swept', 'cup', 'basket'].includes(guard.type) ? layout.gripWidth / 2 + 34 : 0;
  const halfGuard = guard.type === 'katar' ? layout.gripWidth / 2 + 16 : guard.width / 2;
  const crook = art.pommel.type === 'crook' ? 72 : 0;
  const tassel = art.tassel ? 120 : 0;
  return {
    minX: -Math.max(halfBlade + hook, halfGuard, crook, 40),
    maxX: Math.max(halfBlade + sickle, halfGuard, bow, 40) + tassel * 0.7,
    minY: -blade.length - 4 - (hook ? blade.width * 1.8 : 0),
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

export type ReliefFocus = 'full' | 'hilt' | 'tip';

/**
 * 상세 갤러리의 확대 보기용 정사각 viewBox.
 * - hilt: 칼날 밑동부터 손잡이 끝까지
 * - tip: 칼끝 쪽 3할(짧은 칼은 칼날 너비의 7배 이상)
 */
export function focusViewBox(art: SwordArt, focus: ReliefFocus): string {
  if (focus === 'full') return squareViewBox(art, 'fit');
  const full = localBounds(art);
  const { length, width } = art.blade;
  const sleeve = art.blade.sleeve ? art.blade.sleeve.length : 0;
  const bounds: Bounds =
    focus === 'hilt'
      ? { ...full, minY: -Math.max(width * 2.5, sleeve + width) }
      : { ...full, maxY: -length + Math.max(length * 0.3, width * 7) };
  const b = rotatedBounds(bounds);
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const side = Math.max(b.maxX - b.minX, b.maxY - b.minY) * 1.16;
  return `${(cx - side / 2).toFixed(1)} ${(cy - side / 2).toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`;
}

/** 카탈로그 축척: 전장 약 1.5m 칼이 꽉 차는 크기 */
export const CATALOG_SIDE = 1120;

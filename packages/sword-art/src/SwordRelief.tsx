import { type ReactNode, useId } from 'react';

import {
  bladeCenterX,
  bladeOutline,
  bladeStrip,
  bladeWidthAt,
  focusViewBox,
  hamonPath,
  type HiltLayout,
  hiltLayout,
  hookTipPath,
  pointsToPath,
  type ReliefFocus,
  ROTATION_DEG,
  sickleHookPath,
  sleevePoints,
  squareViewBox,
} from './geometry';

import type { SwordArt } from '@snb/domain';

type Layer = 'height' | 'pigment';

/** 높이 지도용 회색 값. 밝을수록 높게 솟아 보입니다. */
const H = {
  low: '#6a6a6a',
  base: '#9a9a9a',
  mid: '#b4b4b4',
  raised: '#cdcdcd',
  top: '#e8e8e8',
};

const STEEL = '#bfc5ca';
const GOLD = '#b48a3c';

/** 칼날 재질별 채색과 진하기 */
const BLADE_PIGMENT: Record<NonNullable<SwordArt['blade']['material']>, [string, number]> = {
  steel: [STEEL, 0.55],
  bronze: ['#b5884a', 0.8],
  wood: ['#8b5a2b', 0.85],
  bamboo: ['#d9c486', 0.85],
  foam: ['#3b6fb6', 0.85],
};

export interface SwordReliefProps {
  art: SwordArt;
  /** 있으면 role="img"와 함께 이름을 붙이고, 없으면 장식 이미지로 숨깁니다. */
  label?: string;
  /** fit: 꽉 차게, catalog: 모든 칼을 같은 축척으로 */
  frame?: 'fit' | 'catalog';
  /** 채색 진하기(0~1) */
  pigment?: number;
  /** 부조 깊이 배율 */
  depth?: number;
  /** 상세 갤러리 확대 보기: 전체, 손잡이, 칼끝 */
  focus?: ReliefFocus;
  className?: string;
  /**
   * 화면 전환(SSGOI hero)의 짝 표시. 목록의 그림(exit)과 상세의 그림(enter)에 같은 key를 달면
   * 화면을 옮길 때 그림이 그 자리로 날아갑니다.
   */
  transition?: { side: 'exit' | 'enter'; key: string };
}

export function SwordRelief({
  art,
  label,
  frame = 'fit',
  pigment = 0.8,
  depth = 1,
  focus = 'full',
  className,
  transition,
}: SwordReliefProps) {
  const rawId = useId();
  const id = (name: string) => `snb${rawId.replace(/[^a-zA-Z0-9]/g, '')}-${name}`;
  const layout = hiltLayout(art);
  const viewBox = focus === 'full' ? squareViewBox(art, frame) : focusViewBox(art, focus);
  const side = Number(viewBox.split(' ')[2]);
  // viewBox가 클수록 1mm가 작게 그려지므로 흐림 반경을 맞춰 줍니다.
  const blur = (side / 260) * depth;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...(transition ? { [`data-hero-${transition.side}-key`]: transition.key } : {})}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
    >
      <defs>
        <filter id={id('relief')} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="height" />
          <feGaussianBlur in="height" stdDeviation={blur} result="soft" />
          <feDiffuseLighting
            in="soft"
            surfaceScale={11 * depth}
            diffuseConstant={1.32}
            lightingColor="#efeee9"
            result="diffuse"
          >
            <feDistantLight azimuth={225} elevation={42} />
          </feDiffuseLighting>
          <feSpecularLighting
            in="soft"
            surfaceScale={11 * depth}
            specularConstant={0.5}
            specularExponent={22}
            lightingColor="#ffffff"
            result="specular"
          >
            <feDistantLight azimuth={225} elevation={40} />
          </feSpecularLighting>
          <feComposite in="specular" in2="diffuse" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" result="carved" />
          <feGaussianBlur in="SourceAlpha" stdDeviation={blur * 2.6} result="shadowBlur" />
          <feOffset in="shadowBlur" dx={blur * 1.6} dy={blur * 2.4} result="shadowOffset" />
          <feFlood floodColor="#4c4a43" floodOpacity={0.32} />
          <feComposite in2="shadowOffset" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="carved" />
          </feMerge>
        </filter>
        <linearGradient id={id('blade-double')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={H.low} />
          <stop offset="0.5" stopColor={H.raised} />
          <stop offset="1" stopColor={H.low} />
        </linearGradient>
        <linearGradient id={id('blade-single')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={H.mid} />
          <stop offset="0.32" stopColor={H.raised} />
          <stop offset="1" stopColor={H.low} />
        </linearGradient>
        <clipPath id={id('grip')}>
          <path d={gripPath(layout)} />
        </clipPath>
      </defs>

      <g filter={`url(#${id('relief')})`}>
        <g transform={`rotate(${ROTATION_DEG})`}>{renderParts(art, layout, 'height', id)}</g>
      </g>
      <g style={{ mixBlendMode: 'multiply' }} opacity={pigment}>
        <g transform={`rotate(${ROTATION_DEG})`}>{renderParts(art, layout, 'pigment', id)}</g>
      </g>
    </svg>
  );
}

function gripPath(layout: HiltLayout): string {
  const { gripStart: y0, gripEnd: y1, gripWidth: w } = layout;
  const half = w / 2;
  const mid = (y0 + y1) / 2;
  return [
    `M${-half} ${y0}`,
    `Q${-half - 3} ${mid} ${-half} ${y1}`,
    `L${half} ${y1}`,
    `Q${half + 3} ${mid} ${half} ${y0}`,
    'Z',
  ].join(' ');
}

function renderParts(art: SwordArt, layout: HiltLayout, layer: Layer, id: (name: string) => string): ReactNode {
  const isHeight = layer === 'height';
  const material = art.blade.material ?? 'steel';
  const [pigmentColor, pigmentOpacity] = BLADE_PIGMENT[material];
  // 나무·대나무·스펀지는 능선이 없는 납작한 면으로 칠합니다.
  const flat = material === 'wood' || material === 'bamboo' || material === 'foam';
  const bladeFill = isHeight
    ? flat
      ? H.mid
      : `url(#${id(art.blade.edge === 'single' ? 'blade-single' : 'blade-double')})`
    : (art.blade.color ?? pigmentColor);
  const bladeOpacity = isHeight ? 1 : pigmentOpacity;

  return (
    <>
      <Blade art={art} fill={bladeFill} opacity={bladeOpacity} layer={layer} />
      {art.collar ? <Collar art={art} layout={layout} layer={layer} /> : null}
      <Guard art={art} layout={layout} layer={layer} />
      <Grip art={art} layout={layout} layer={layer} clipId={id('grip')} />
      <Pommel art={art} layout={layout} layer={layer} />
      {art.tassel ? <Tassel color={art.tassel} layout={layout} layer={layer} /> : null}
    </>
  );
}

function Blade({ art, fill, opacity, layer }: { art: SwordArt; fill: string; opacity: number; layer: Layer }) {
  const isHeight = layer === 'height';
  const { blade } = art;
  const outline = pointsToPath(bladeOutline(art));

  return (
    <g>
      <path d={outline} fill={fill} fillOpacity={opacity} />
      {blade.tip === 'sickle' ? (
        <path d={sickleHookPath(art)} fill={isHeight ? H.mid : fill} fillOpacity={opacity} />
      ) : null}
      {blade.tip === 'hook' ? (
        <path
          d={hookTipPath(art)}
          fill="none"
          stroke={isHeight ? H.mid : STEEL}
          strokeOpacity={isHeight ? 1 : 0.7}
          strokeWidth={blade.width * 0.55}
          strokeLinecap="round"
        />
      ) : null}
      {blade.material === 'bamboo' ? <BambooSlats art={art} layer={layer} /> : null}
      {blade.teeth ? <ObsidianTeeth art={art} layer={layer} /> : null}

      {blade.fuller ? (
        <path
          d={pointsToPath(
            blade.edge === 'single' ? bladeStrip(art, 0.02, 0.72, 0.24, 0.16) : bladeStrip(art, 0.02, 0.74, 0.5, 0.26),
          )}
          fill={isHeight ? H.low : '#a3abb1'}
          fillOpacity={isHeight ? 1 : 0.7}
        />
      ) : null}

      {blade.ridge && !blade.fuller ? (
        <path
          d={pointsToPath(bladeStrip(art, 0.0, 0.985, 0.5, 0.05))}
          fill={isHeight ? H.top : '#d7dbde'}
          fillOpacity={isHeight ? 1 : 0.6}
        />
      ) : null}

      {blade.hamon ? (
        <path
          d={hamonPath(art)}
          fill="none"
          stroke={isHeight ? H.base : '#8f989f'}
          strokeWidth={blade.width * 0.06}
          strokeLinecap="round"
          opacity={isHeight ? 0.9 : 0.75}
        />
      ) : null}

      {blade.inscription === 'stars' ? <Stars art={art} layer={layer} /> : null}
      {blade.inscription === 'runes' ? <Runes art={art} layer={layer} /> : null}
      {blade.sleeve ? <Sleeve art={art} layer={layer} /> : null}
    </g>
  );
}

/** 칼날 밑동을 감싼 덧쇠와 리벳 네 개(쌍수도) */
function Sleeve({ art, layer }: { art: SwordArt; layer: Layer }) {
  const sleeve = art.blade.sleeve;
  if (!sleeve) return null;
  const isHeight = layer === 'height';
  const end = -Math.min(art.blade.length * 0.6, sleeve.length);
  const w = art.blade.width;
  // 코등이 쪽 두 개와 칼날 쪽 두 개. 양쪽 모두 칼날 너비 방향으로 짝지어 살짝 엇갈립니다.
  const rivets: Array<[number, number]> = [
    [-w * 0.27, -w * 0.95],
    [w * 0.27, -w * 0.75],
    [-w * 0.27, end + w * 0.6],
    [w * 0.27, end + w * 0.8],
  ];
  // 접어 감싼 덧쇠의 이음선. 날 쪽 가장자리를 따라갑니다.
  const seam = Array.from({ length: 9 }, (_, index) => {
    const y = (end * index) / 8;
    return `${bladeCenterX(art, -y / art.blade.length) + w * 0.4},${y}`;
  }).join(' ');
  return (
    <g>
      <path d={pointsToPath(sleevePoints(art, sleeve.length))} fill={isHeight ? H.raised : sleeve.color} />
      {/* 높이 층에 그리면 조명 때문에 검은 홈처럼 보이므로 채색 층에만 옅게 그립니다. */}
      {isHeight ? null : <polyline points={seam} fill="none" stroke="#00000022" strokeWidth={1.5} />}
      {rivets.map(([x, y]) => {
        const cx = x + bladeCenterX(art, -y / art.blade.length);
        return (
          <g key={`${x}${y}`}>
            <circle cx={cx} cy={y} r={w * 0.12} fill={isHeight ? H.low : '#00000055'} />
            <circle cx={cx} cy={y} r={w * 0.075} fill={isHeight ? H.top : sleeve.color} />
          </g>
        );
      })}
    </g>
  );
}

/** 죽도: 대나무 쪽 네 가닥과 묶는 가죽 띠 */
function BambooSlats({ art, layer }: { art: SwordArt; layer: Layer }) {
  const isHeight = layer === 'height';
  const stroke = isHeight ? H.low : '#8a7240';
  return (
    <g>
      {[0.3, 0.5, 0.7].map((offset) => (
        <path key={offset} d={pointsToPath(bladeStrip(art, 0.0, 0.97, offset, 0.03))} fill={stroke} fillOpacity={0.8} />
      ))}
      <path d={pointsToPath(bladeStrip(art, 0.72, 0.75, 0.5, 1.05))} fill={isHeight ? H.raised : '#e9e1cc'} />
      <path d={pointsToPath(bladeStrip(art, 0.93, 1, 0.5, 1.05))} fill={isHeight ? H.raised : '#e9e1cc'} />
    </g>
  );
}

/** 마쿠아후이틀: 나무 몸체 양쪽 날에 박은 흑요석 조각 */
function ObsidianTeeth({ art, layer }: { art: SwordArt; layer: Layer }) {
  const isHeight = layer === 'height';
  const fill = isHeight ? H.top : '#1f1d24';
  const teeth: ReactNode[] = [];
  for (let t = 0.08; t < 0.93; t += 0.065) {
    const y = -t * art.blade.length;
    const w = bladeWidthAt(art, t);
    const cx = bladeCenterX(art, t);
    const s = art.blade.width * 0.22;
    teeth.push(
      <path
        key={`l${t}`}
        d={`M${cx - w / 2} ${y - s} L${cx - w / 2 - s * 1.6} ${y} L${cx - w / 2} ${y + s} Z`}
        fill={fill}
      />,
      <path
        key={`r${t}`}
        d={`M${cx + w / 2} ${y - s} L${cx + w / 2 + s * 1.6} ${y} L${cx + w / 2} ${y + s} Z`}
        fill={fill}
      />,
    );
  }
  return <g>{teeth}</g>;
}

/** 사인검의 별자리 상감 */
function Stars({ art, layer }: { art: SwordArt; layer: Layer }) {
  const fill = layer === 'height' ? H.top : GOLD;
  const { length } = art.blade;
  // 북두칠성 + 주변 별을 칼날 축을 따라 배치(t, 가로 오프셋 비율)
  const stars: Array<[number, number, number]> = [
    [0.12, 0.0, 1],
    [0.17, 0.12, 0.8],
    [0.22, 0.05, 0.9],
    [0.27, -0.1, 0.8],
    [0.31, 0.02, 1],
    [0.36, 0.14, 0.8],
    [0.42, 0.06, 1],
    [0.5, -0.12, 0.7],
    [0.55, 0.1, 0.8],
    [0.6, -0.04, 0.9],
    [0.66, 0.08, 0.7],
  ];
  return (
    <g>
      {stars.map(([t, dx, r], index) => {
        const w = bladeWidthAt(art, t);
        return <circle key={index} cx={dx * w} cy={-t * length} r={w * 0.07 * r} fill={fill} />;
      })}
      <path
        d={stars
          .slice(0, 7)
          .map(([t, dx], index) => `${index === 0 ? 'M' : 'L'}${dx * bladeWidthAt(art, t)} ${-t * length}`)
          .join(' ')}
        fill="none"
        stroke={fill}
        strokeWidth={art.blade.width * 0.02}
        opacity={0.8}
      />
    </g>
  );
}

/** 룬 문자처럼 보이는 새김 (특정 문자를 쓰지 않은 장식 획) */
function Runes({ art, layer }: { art: SwordArt; layer: Layer }) {
  const stroke = layer === 'height' ? H.top : GOLD;
  const { length } = art.blade;
  const glyphs = [
    'M0 -6 L0 6 M0 -6 L4 -2 M0 -1 L4 3',
    'M-3 -6 L0 6 L3 -6',
    'M0 -6 L0 6 M-3 -2 L3 2',
    'M0 -6 L0 6 M0 0 L4 -4 M0 0 L4 4',
    'M-3 6 L0 -6 L3 6 M-2 1 L2 1',
  ];
  const items = Array.from({ length: 9 }, (_, index) => index);
  return (
    <g stroke={stroke} strokeWidth={art.blade.width * 0.035} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {items.map((index) => {
        const t = 0.06 + index * 0.055;
        const w = bladeWidthAt(art, t);
        const scale = w / 22;
        return (
          <path
            key={index}
            d={glyphs[index % glyphs.length]}
            transform={`translate(${-art.blade.curve * t * t} ${-t * length}) scale(${scale})`}
          />
        );
      })}
    </g>
  );
}

function Collar({ art, layout, layer }: { art: SwordArt; layout: HiltLayout; layer: Layer }) {
  const w = art.blade.width + 10;
  const h = layout.collarHeight;
  const fill = layer === 'height' ? H.raised : (art.collar?.color ?? GOLD);
  return (
    <g>
      <rect x={-w / 2 - art.blade.width * 0.04} y={-h} width={w} height={h} rx={3} fill={fill} />
      <path
        d={`M${-w / 2 + 3} ${-h * 0.55} L${w / 2 - 3} ${-h * 0.62}`}
        stroke={layer === 'height' ? H.top : '#00000033'}
        strokeWidth={2}
      />
    </g>
  );
}

function Guard({ art, layout, layer }: { art: SwordArt; layout: HiltLayout; layer: Layer }) {
  const isHeight = layer === 'height';
  const { guard } = art;
  const fill = isHeight ? H.raised : guard.color;
  const accent = isHeight ? H.top : (guard.accent ?? guard.color);
  const t = layout.guardThickness;
  const half = guard.width / 2;
  const cy = t / 2;

  switch (guard.type) {
    case 'none':
      return null;
    case 'disc':
      return (
        <g>
          {/* 칼날 쪽 받침(세파) */}
          <rect x={-art.blade.width / 2 - 6} y={-3} width={art.blade.width + 12} height={4} rx={1} fill={accent} />
          <ellipse cx={0} cy={cy} rx={half} ry={t / 2} fill={fill} />
          <ellipse cx={0} cy={cy} rx={half - 5} ry={t / 2 - 3} fill="none" stroke={accent} strokeWidth={3} />
          <ellipse cx={0} cy={cy} rx={half * 0.45} ry={t * 0.22} fill={isHeight ? H.mid : '#00000022'} />
          <rect x={-layout.gripWidth / 2 - 2} y={t - 1} width={layout.gripWidth + 4} height={4} rx={1} fill={accent} />
        </g>
      );
    case 'plate': {
      // 손잡이 쪽 면이 보이도록 비스듬히 그려, 칼날 쪽으로 두툼한 테두리가 드러납니다.
      const ry = half * 0.42;
      const rimY = t * 0.2;
      const bevelY = rimY + (t - rimY) * 0.45;
      const rim = isHeight ? H.mid : accent;
      return (
        <g>
          <ellipse cx={0} cy={rimY} rx={half} ry={ry} fill={rim} />
          <rect x={-half} y={rimY} width={guard.width} height={t - rimY} fill={rim} />
          <ellipse
            cx={0}
            cy={bevelY}
            rx={half}
            ry={ry}
            fill="none"
            stroke={isHeight ? H.top : '#ffffff55'}
            strokeWidth={1.5}
          />
          <ellipse cx={0} cy={t} rx={half} ry={ry} fill={fill} />
          <ellipse
            cx={0}
            cy={t}
            rx={half - 3}
            ry={ry - 2}
            fill="none"
            stroke={isHeight ? H.top : '#ffffff66'}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    case 'cross':
      return (
        <g>
          <rect x={-half + 8} y={cy - 6} width={guard.width - 16} height={12} rx={5} fill={fill} />
          <circle cx={-half + 8} cy={cy} r={10} fill={fill} />
          <circle cx={half - 8} cy={cy} r={10} fill={fill} />
          <path d={`M0 ${cy - 14} L14 ${cy} L0 ${cy + 14} L-14 ${cy} Z`} fill={accent} />
        </g>
      );
    case 'quillon': {
      const arm = (dir: 1 | -1) =>
        `M0 ${cy} C${dir * half * 0.35} ${cy + 8} ${dir * half * 0.8} ${cy + 6} ${dir * half * 0.95} ${cy - 22} S${dir * half * 0.72} ${cy - 40} ${dir * half * 0.66} ${cy - 30}`;
      return (
        <g>
          <path d={arm(-1)} fill="none" stroke={fill} strokeWidth={12} strokeLinecap="round" />
          <path d={arm(1)} fill="none" stroke={fill} strokeWidth={12} strokeLinecap="round" />
          <circle cx={-half * 0.66} cy={cy - 30} r={8} fill={accent} />
          <circle cx={half * 0.66} cy={cy - 30} r={8} fill={accent} />
          <path d={`M0 ${cy - 18} L12 ${cy} L0 ${cy + 16} L-12 ${cy} Z`} fill={accent} />
        </g>
      );
    }
    case 'jian':
      return (
        <g>
          <path
            d={`M${-half} ${cy + 2} Q${-half * 0.5} ${cy - 10} 0 ${cy - t * 0.62} Q${half * 0.5} ${cy - 10} ${half} ${cy + 2} Q${half * 0.35} ${cy + t * 0.5} 0 ${cy + t * 0.55} Q${-half * 0.35} ${cy + t * 0.5} ${-half} ${cy + 2} Z`}
            fill={fill}
          />
          <path
            d={`M${-half * 0.55} ${cy} Q0 ${cy - 12} ${half * 0.55} ${cy}`}
            fill="none"
            stroke={accent}
            strokeWidth={3}
          />
        </g>
      );
    case 'block':
      return (
        <g>
          <rect x={-half} y={0} width={guard.width} height={t} rx={t / 2.2} fill={fill} />
          <rect x={-half + 6} y={t * 0.4} width={guard.width - 12} height={3} rx={1.5} fill={accent} />
        </g>
      );
    case 'dguard':
    case 'swept':
    case 'cup': {
      // 손등 보호대: 코등이 날 쪽 끝에서 손잡이를 감싸며 끝장식까지 이어지는 고리
      const bow = `M${half - 4} ${cy} C${half + 22} ${cy + 30} ${layout.gripWidth / 2 + 30} ${layout.gripEnd - 30} ${layout.gripWidth / 2 + 2} ${layout.gripEnd + 4}`;
      return (
        <g>
          <rect x={-half} y={cy - 5} width={guard.width} height={10} rx={5} fill={fill} />
          <circle cx={-half + 2} cy={cy} r={7} fill={fill} />
          <path d={bow} fill="none" stroke={fill} strokeWidth={7} strokeLinecap="round" />
          {guard.type === 'swept' ? (
            <>
              {/* 칼날 밑동을 감싸는 고리와 손잡이 반대쪽으로 휘는 가지 */}
              <ellipse cx={0} cy={-18} rx={half * 0.55} ry={13} fill="none" stroke={fill} strokeWidth={5} />
              <path
                d={`M${-half + 6} ${cy} C${-half - 10} ${cy + 26} ${-layout.gripWidth / 2 - 18} ${cy + 46} ${-layout.gripWidth / 2 - 2} ${cy + 70}`}
                fill="none"
                stroke={fill}
                strokeWidth={5}
                strokeLinecap="round"
              />
            </>
          ) : null}
          {guard.type === 'cup' ? <ellipse cx={0} cy={cy - 6} rx={half * 0.62} ry={14} fill={accent} /> : null}
        </g>
      );
    }
    case 'basket': {
      // 바구니 힐트: 손을 감싸는 쇠창살
      const gw = layout.gripWidth / 2 + 22;
      const y1 = layout.gripEnd - 6;
      const bars = [0.25, 0.5, 0.75];
      return (
        <g fill="none" stroke={fill} strokeWidth={6} strokeLinecap="round">
          <path d={`M${-half} ${cy} Q${-gw - 8} ${(cy + y1) / 2} ${-layout.gripWidth / 2} ${y1}`} />
          <path d={`M${half} ${cy} Q${gw + 8} ${(cy + y1) / 2} ${layout.gripWidth / 2} ${y1}`} />
          <path d={`M${-half} ${cy} L${half} ${cy}`} strokeWidth={10} />
          {bars.map((r) => (
            <path
              key={r}
              d={`M${-gw + 2} ${cy + (y1 - cy) * r} Q0 ${cy + (y1 - cy) * r + 10} ${gw - 2} ${cy + (y1 - cy) * r}`}
              strokeWidth={4}
            />
          ))}
          <circle cx={gw - 6} cy={cy + (y1 - cy) * 0.5} r={6} fill={accent} stroke="none" />
        </g>
      );
    }
    case 'katar': {
      // 카타르: 손잡이 양옆의 긴 막대와 칼날 쪽 넓은 받침
      const sx = layout.gripWidth / 2;
      const y1 = layout.gripEnd + 8;
      return (
        <g>
          <path d={`M${-sx - 10} ${-2} L${sx + 10} ${-2} L${sx + 4} ${t} L${-sx - 4} ${t} Z`} fill={fill} />
          <rect x={-sx - 6} y={0} width={10} height={y1} rx={4} fill={fill} />
          <rect x={sx - 4} y={0} width={10} height={y1} rx={4} fill={fill} />
          <circle cx={-sx - 1} cy={y1} r={7} fill={accent} />
          <circle cx={sx + 1} cy={y1} r={7} fill={accent} />
        </g>
      );
    }
    case 'crescent':
      // 구(호두구)의 초승달 코등이: 양 끝이 칼날 쪽을 향합니다.
      return (
        <path
          d={`M${-half} ${cy - 26} Q0 ${cy + 40} ${half} ${cy - 26} Q0 ${cy + 16} ${-half} ${cy - 26} Z`}
          fill={fill}
        />
      );
    case 'ring':
      // 총검식: 짧은 십자와 등 쪽 총구 고리
      return (
        <g>
          <rect x={-half} y={cy - 5} width={guard.width} height={10} rx={4} fill={fill} />
          <circle cx={-half - 12} cy={cy} r={13} fill="none" stroke={fill} strokeWidth={5} />
        </g>
      );
    case 'ganja':
      // 크리스의 간자: 날 쪽으로 길게 뻗은 비대칭 받침
      return (
        <path
          d={`M${-half * 0.55} ${t} L${-half * 0.6} ${2} Q${half * 0.3} ${-6} ${half * 1.05} ${-10} Q${half * 0.95} ${t * 0.6} ${half * 0.5} ${t} Z`}
          fill={fill}
        />
      );
  }
}

/** 코등이 판에서 솟은 원통형 쇠 깃. 양 끝을 타원으로 그려 원통처럼 보이게 합니다. */
function Ferrule({
  ferrule,
  y0,
  width,
  isHeight,
}: {
  ferrule: NonNullable<SwordArt['grip']['ferrule']>;
  y0: number;
  width: number;
  isHeight: boolean;
}) {
  const rx = width / 2 + 3;
  const ry = rx * 0.42;
  const end = y0 + ferrule.length;
  const fill = isHeight ? H.top : ferrule.color;
  return (
    <g>
      <path d={`M${-rx} ${y0} L${-rx} ${end} A${rx} ${ry} 0 0 0 ${rx} ${end} L${rx} ${y0} Z`} fill={fill} />
      <ellipse cx={0} cy={y0} rx={rx} ry={ry} fill={fill} />
      <path
        d={`M${-rx} ${end} A${rx} ${ry} 0 0 0 ${rx} ${end}`}
        fill="none"
        stroke={isHeight ? H.low : '#00000040'}
        strokeWidth={1.5}
      />
      <rect
        x={-rx * 0.45}
        y={y0 - ry * 0.3}
        width={rx * 0.3}
        height={ferrule.length + ry * 0.9}
        fill={isHeight ? H.top : '#ffffff40'}
      />
    </g>
  );
}

function Grip({ art, layout, layer, clipId }: { art: SwordArt; layout: HiltLayout; layer: Layer; clipId: string }) {
  const isHeight = layer === 'height';
  const { grip } = art;
  const base = isHeight ? H.base : grip.color;
  const wrapFill = isHeight ? H.raised : (grip.wrapColor ?? grip.color);
  const { gripStart: y0, gripEnd: y1, gripWidth: w } = layout;
  const half = w / 2 + 4;
  const length = y1 - y0;

  let wrap: ReactNode = null;
  switch (grip.wrap) {
    case 'diamond': {
      // 손잡이 끈(이토)이 엇갈려 감기며 마름모 창을 만듭니다.
      const step = w * 0.95;
      const count = Math.ceil(length / step);
      wrap = Array.from({ length: count }, (_, index) => {
        const y = y0 + index * step;
        return (
          <g key={index}>
            <path
              d={`M${-half} ${y} L${half} ${y + step * 0.5} L${half} ${y + step * 0.5 + w * 0.34} L${-half} ${y + w * 0.34} Z`}
              fill={wrapFill}
            />
            <path
              d={`M${half} ${y} L${-half} ${y + step * 0.5} L${-half} ${y + step * 0.5 + w * 0.34} L${half} ${y + w * 0.34} Z`}
              fill={wrapFill}
            />
            <path
              d={`M0 ${y + step * 0.25 + w * 0.17 - 3} L0 ${y + step * 0.25 + w * 0.17 + 3}`}
              stroke={isHeight ? H.low : '#00000040'}
              strokeWidth={2}
            />
          </g>
        );
      });
      break;
    }
    case 'cord': {
      const step = 11;
      const count = Math.ceil(length / step) + 2;
      wrap = Array.from({ length: count }, (_, index) => {
        const y = y0 - step + index * step;
        return (
          <path
            key={index}
            d={`M${-half} ${y} L${half} ${y + 7} L${half} ${y + 15} L${-half} ${y + 8} Z`}
            fill={wrapFill}
          />
        );
      });
      break;
    }
    case 'wire': {
      const step = 4.2;
      const count = Math.ceil(length / step) + 2;
      wrap = (
        <>
          {Array.from({ length: count }, (_, index) => {
            const y = y0 - step + index * step;
            return (
              <path
                key={index}
                d={`M${-half} ${y} L${half} ${y + 3}`}
                stroke={wrapFill}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            );
          })}
          <rect x={-half} y={y0} width={half * 2} height={7} fill={isHeight ? H.top : wrapFill} />
          <rect x={-half} y={y1 - 7} width={half * 2} height={7} fill={isHeight ? H.top : wrapFill} />
        </>
      );
      break;
    }
    case 'leather': {
      const risers = [0.28, 0.52, 0.76];
      wrap = risers.map((r) => (
        <rect key={r} x={-half} y={y0 + length * r - 3} width={half * 2} height={6} rx={3} fill={wrapFill} />
      ));
      break;
    }
    case 'ribbed': {
      const ribs = 4;
      wrap = Array.from({ length: ribs }, (_, index) => {
        const y = y0 + (length / ribs) * (index + 0.5);
        return <ellipse key={index} cx={0} cy={y} rx={half} ry={length / ribs / 2.6} fill={wrapFill} />;
      });
      break;
    }
    case 'helix': {
      // 촘촘한 나선 끈(쌍수도): 가는 끈이 빈틈없이 비스듬히 감깁니다.
      const step = 4.6;
      const count = Math.ceil(length / step) + 2;
      wrap = Array.from({ length: count }, (_, index) => {
        const y = y0 - step + index * step;
        return (
          <path
            key={index}
            d={`M${-half} ${y} L${half} ${y + 2.4}`}
            stroke={wrapFill}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
        );
      });
      break;
    }
    case 'split':
      // 발리송: 둘로 나뉜 손잡이 사이의 틈과 고정 핀
      wrap = (
        <>
          <rect x={-1.5} y={y0} width={3} height={length} fill={isHeight ? H.low : '#00000055'} />
          <circle cx={-w * 0.25} cy={y0 + 10} r={3} fill={isHeight ? H.top : '#00000040'} />
          <circle cx={w * 0.25} cy={y0 + 10} r={3} fill={isHeight ? H.top : '#00000040'} />
        </>
      );
      break;
    case 'plain':
    case 'katar':
      break;
  }

  if (grip.wrap === 'katar') {
    // 카타르는 칼날과 직각인 가로 손잡이 두 개를 쥡니다.
    const sx = w / 2;
    return (
      <g>
        {[0.35, 0.62].map((r) => (
          <rect key={r} x={-sx} y={y0 + length * r - 6} width={sx * 2} height={12} rx={6} fill={wrapFill} />
        ))}
      </g>
    );
  }

  return (
    <g>
      <path d={gripPath(layout)} fill={base} />
      <g clipPath={`url(#${clipId})`}>{wrap}</g>
      {/* 손잡이 양 끝 쇠테(후치) */}
      <rect x={-w / 2 - 2} y={y0} width={w + 4} height={7} rx={2} fill={isHeight ? H.raised : art.pommel.color} />
      {grip.ferrule ? <Ferrule ferrule={grip.ferrule} y0={y0} width={w} isHeight={isHeight} /> : null}
    </g>
  );
}

function Pommel({ art, layout, layer }: { art: SwordArt; layout: HiltLayout; layer: Layer }) {
  const isHeight = layer === 'height';
  const { pommel } = art;
  const fill = isHeight ? H.raised : pommel.color;
  const hi = isHeight ? H.top : pommel.color;
  const y = layout.gripEnd;
  const w = layout.gripWidth;

  switch (pommel.type) {
    case 'cap':
      return (
        <g>
          <path
            d={`M${-w / 2 - 3} ${y - 4} L${w / 2 + 3} ${y - 4} L${w / 2 + 1} ${y + 14} Q0 ${y + 22} ${-w / 2 - 1} ${y + 14} Z`}
            fill={fill}
          />
          <path
            d={`M${-w / 2 + 2} ${y + 4} L${w / 2 - 2} ${y + 4}`}
            stroke={isHeight ? H.top : '#00000030'}
            strokeWidth={2}
          />
        </g>
      );
    case 'wheel':
    case 'gem':
      return (
        <g>
          <rect x={-w / 2 + 2} y={y - 2} width={w - 4} height={10} rx={3} fill={fill} />
          <circle cx={0} cy={y + 30} r={26} fill={fill} />
          <circle
            cx={0}
            cy={y + 30}
            r={16}
            fill={isHeight ? H.top : '#ffffff00'}
            stroke={isHeight ? H.mid : '#00000026'}
            strokeWidth={3}
          />
          {pommel.type === 'gem' ? (
            <circle cx={0} cy={y + 30} r={10} fill={isHeight ? '#f5f5f5' : (pommel.gem ?? '#3b5f8f')} />
          ) : null}
        </g>
      );
    case 'lobed':
      return (
        <g>
          <rect x={-36} y={y - 2} width={72} height={14} rx={5} fill={fill} />
          {[-22, 0, 22].map((x) => (
            <circle key={x} cx={x} cy={y + 18} r={x === 0 ? 15 : 12} fill={x === 0 ? hi : fill} />
          ))}
        </g>
      );
    case 'ball':
      return (
        <g>
          <rect x={-w / 2} y={y - 2} width={w} height={8} rx={3} fill={fill} />
          <ellipse cx={0} cy={y + 22} rx={24} ry={20} fill={fill} />
          <circle cx={0} cy={y + 36} r={5} fill={hi} />
        </g>
      );
    case 'ring':
      return (
        <g>
          <rect x={-w / 2} y={y - 2} width={w} height={10} rx={3} fill={fill} />
          <ellipse cx={0} cy={y + 34} rx={30} ry={24} fill="none" stroke={fill} strokeWidth={9} />
          <circle cx={0} cy={y + 34} r={8} fill={hi} />
        </g>
      );
    case 'none':
      return null;
    case 'crook':
      // 지팡이칼의 굽은 손잡이 머리(등 쪽으로 휨)
      return (
        <path
          d={`M0 ${y - 4} C0 ${y + 46} ${-62} ${y + 52} ${-64} ${y + 14}`}
          fill="none"
          stroke={fill}
          strokeWidth={w * 0.85}
          strokeLinecap="round"
        />
      );
    case 'beak':
      // 세이버의 새부리 끝장식(날 쪽으로 휨)
      return (
        <path
          d={`M${-w / 2 - 1} ${y - 4} L${w / 2 + 1} ${y - 4} Q${w / 2 + 18} ${y + 8} ${w / 2 + 10} ${y + 26} Q${-w / 2 + 2} ${y + 26} ${-w / 2 - 3} ${y + 8} Z`}
          fill={fill}
        />
      );
    case 'spike':
      return (
        <g>
          <rect x={-w / 2 - 1} y={y - 2} width={w + 2} height={8} rx={3} fill={fill} />
          <path d={`M${-w / 2 + 2} ${y + 6} L${w / 2 - 2} ${y + 6} L0 ${y + 44} Z`} fill={hi} />
        </g>
      );
    case 'jian':
      return (
        <g>
          <path
            d={`M${-w / 2 - 2} ${y - 2} L${w / 2 + 2} ${y - 2} L${w / 2 + 12} ${y + 26} Q0 ${y + 36} ${-w / 2 - 12} ${y + 26} Z`}
            fill={fill}
          />
          <path
            d={`M${-w / 2 + 2} ${y + 12} Q0 ${y + 4} ${w / 2 - 2} ${y + 12}`}
            fill="none"
            stroke={hi}
            strokeWidth={3}
          />
        </g>
      );
  }
}

/** 손잡이 끝에 매단 술(장식 매듭). 회전 후 아래로 늘어지도록 (+x,+y) 방향으로 그립니다. */
function Tassel({ color, layout, layer }: { color: string; layout: HiltLayout; layer: Layer }) {
  const isHeight = layer === 'height';
  const fill = isHeight ? H.mid : color;
  const y = layout.pommelEnd - 4;
  const knotX = 42;
  const knotY = y + 30;
  const strands = Array.from({ length: 9 }, (_, index) => index - 4);
  return (
    <g>
      <path
        d={`M0 ${y - 6} Q8 ${y + 26} ${knotX} ${knotY}`}
        fill="none"
        stroke={fill}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={knotX} cy={knotY} r={8} fill={isHeight ? H.raised : color} />
      {strands.map((s) => (
        <path
          key={s}
          d={`M${knotX} ${knotY + 4} Q${knotX + 30 + s * 2} ${knotY + 34 - s * 2} ${knotX + 56 + s * 5} ${knotY + 60 - s * 5}`}
          fill="none"
          stroke={fill}
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

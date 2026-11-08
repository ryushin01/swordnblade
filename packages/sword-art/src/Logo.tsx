import { useId } from 'react';

export interface BladeMarkProps {
  className?: string;
  /** 있으면 이름이 있는 이미지, 없으면 장식 */
  label?: string;
}

/**
 * sword & blade 칼날 엠블럼.
 * 가는 양날 칼날이 원을 위에서 아래로 꿰뚫고, 칼날의 홈이 선으로 새겨져 있습니다.
 */
export function BladeMark({ className, label }: BladeMarkProps) {
  const rawId = useId();
  const clip = `mark${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
    >
      <defs>
        <clipPath id={clip}>
          <rect x="0" y="0" width="64" height="64" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="34" r="20" strokeWidth="1.4" />
        {/* 칼날: 가늘고 긴 칼날이 길게 좁아지며 뾰족한 칼끝으로 끝납니다. */}
        <path d="M32 1.5 L34.3 15 L33.6 45 L30.4 45 L29.7 15 Z" fill="currentColor" stroke="none" />
        <path d="M32 14 L32 42.5" stroke="var(--mark-groove, #ffffff)" strokeWidth="0.7" opacity="0.75" />
        {/* 코등이: 칼끝 쪽으로 살짝 휜 짧은 가지 */}
        <path d="M24.5 47.2 Q32 44.6 39.5 47.2" strokeWidth="2" />
        {/* 손잡이와 끝장식 */}
        <path d="M32 48.8 L32 58.6" strokeWidth="2.6" />
        <path d="M30.2 60.6 L32 58.8 L33.8 60.6 L32 62.4 Z" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

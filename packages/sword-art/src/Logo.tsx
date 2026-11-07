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
        {/* 칼날 */}
        <path d="M32 3 L36 12 L35.2 44 L28.8 44 L28 12 Z" fill="currentColor" stroke="none" />
        <path d="M32 10 L32 41" stroke="var(--mark-groove, #ffffff)" strokeWidth="1" opacity="0.7" />
        {/* 코등이 */}
        <path d="M21 46 Q32 42 43 46" strokeWidth="2.6" />
        {/* 손잡이와 끝장식 */}
        <path d="M32 48 L32 58" strokeWidth="3.6" />
        <circle cx="32" cy="60.5" r="2.2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

import type { ReactNode } from 'react';

/**
 * 가로로 넘치는 표를 감쌉니다. 키보드로도 스크롤할 수 있게 초점을 받고 이름을 가집니다.
 */
export function ScrollRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="scroll-region">
      {children}
    </div>
  );
}

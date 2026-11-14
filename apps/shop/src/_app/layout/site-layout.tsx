import { RouteBoundary } from '../transitions/route-boundary';

import type { ReactNode } from 'react';

/**
 * 라우트 그룹 (site)의 레이아웃: 화면 전환 경계.
 * relative·z-0은 떠나는 화면의 기준과 쌓임 맥락이고, overflow-x는 hidden이 아니라 clip이어야 스크롤 복원이 맞습니다.
 * 겹쳐 움직이는 동안 뒤 화면이 비치지 않도록 화면마다 바탕을 칠합니다.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-0 min-h-dvh overflow-x-clip">
      <RouteBoundary className="min-h-dvh bg-wall">{children}</RouteBoundary>
    </div>
  );
}

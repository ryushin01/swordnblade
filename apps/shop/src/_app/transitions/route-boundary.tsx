'use client';

import { usePathname } from 'next/navigation';

import type { ReactNode } from 'react';

/**
 * 화면 전환(SSGOI)의 라우트 경계. 주소가 바뀌면 이 요소가 새로 만들어지고, SSGOI가 떠나는 요소와 들어오는 요소를 함께 움직입니다.
 *
 * `@ssgoi/react/nextjs`의 SsgoiRouteBoundary는 안에 Suspense를 두는데, 그러면 비동기로 그리는 화면(도검 상세 등)이
 * 스트리밍으로 나뉘어 자바스크립트 없이는 내용이 숨은 채로 남습니다. 이 앱은 cacheComponents를 쓰지 않아
 * usePathname이 멈추지 않으므로, 문서의 수동 경계(manual boundary)처럼 Suspense 없이 직접 둡니다.
 */
export function RouteBoundary({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  return (
    <div key={pathname} data-ssgoi-transition={pathname} className={className}>
      {children}
    </div>
  );
}

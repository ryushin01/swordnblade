'use client';

import { type ReactNode, useSyncExternalStore } from 'react';
import { Ssgoi } from '@ssgoi/react';

import { selectConfig } from './config';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** 동작 줄이기 설정. 서버에서는 false로 두고 수화 뒤 실제 값을 읽습니다. */
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );

/**
 * 화면 전환(SSGOI) 제공자. 라우트 경계(RouteBoundary)는 라우트 그룹 (site)의 레이아웃에 둡니다.
 * 없는 주소([...rest])는 그 바깥에 두어 지금처럼 404로 응답합니다.
 */
export function PageTransitions({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return <Ssgoi config={selectConfig(reduced)}>{children}</Ssgoi>;
}

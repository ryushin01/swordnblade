'use client';

import { useSyncExternalStore } from 'react';

const MINUTE = 60_000;
const toMinute = (time: number) => time - (time % MINUTE);

/** 분이 바뀔 때마다 알립니다. */
function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(
      () => {
        onChange();
        schedule();
      },
      MINUTE - (Date.now() % MINUTE),
    );
  };
  schedule();
  return () => clearTimeout(timer);
}

const currentMinute = () => toMinute(Date.now());

/**
 * 할인 기간을 가르는 '지금'(분 단위 ms). 분이 바뀌면 다시 그립니다.
 * 관리 화면은 상품을 브라우저의 Mock API에서 받아 그리므로, 서버 렌더와 hydrate 결과는 이 값에 따라 달라지지 않습니다.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, currentMinute, currentMinute);
}

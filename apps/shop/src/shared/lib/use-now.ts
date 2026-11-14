'use client';

import { useSyncExternalStore } from 'react';
import { useNow as useIntlNow } from 'next-intl';

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

const clientNow = () => toMinute(Date.now());

/**
 * 할인 기간을 가르는 '지금'(분 단위 ms).
 * 서버가 그린 HTML과 같게 hydrate하도록 처음에는 서버의 요청 시각(next-intl now)을 쓰고,
 * 그 뒤에는 브라우저 시계로 바꿔 분마다 갱신합니다. 할인이 자정에 시작·끝나도 새로고침 없이 바뀝니다.
 */
export function useNow(): number {
  const serverNow = toMinute(useIntlNow().getTime());
  return useSyncExternalStore(subscribe, clientNow, () => serverNow);
}

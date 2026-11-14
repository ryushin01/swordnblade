import { fade, hero } from '@ssgoi/react/view-transitions';

import type { SsgoiConfig } from '@ssgoi/react';

// 설정 객체는 컴포넌트 밖에 둡니다. 렌더마다 새로 만들면 전환 엔진이 다시 만들어져 저장된 스크롤 위치를 잃습니다.

/**
 * 도검 벽·함께 볼 도검·최근 본 도검의 카드를 누르면 카드의 부조(data-hero-exit-key)가
 * 상세 화면의 큰 부조(data-hero-enter-key)로 날아갑니다. 나머지 이동은 fade. 뒤로 가면 반대로 움직입니다.
 *
 * 영어 주소(/en/...)는 규칙에 그대로 적습니다. middleware로 언어 접두어를 떼면 언어를 바꿀 때(/ → /en)
 * 같은 화면끼리의 이동으로 보여, 떠나는 화면이 지워지지 않고 위에 남습니다.
 */
export const motionConfig: SsgoiConfig = {
  transitions: [
    { priority: -100, on: '/**', transition: fade() },
    {
      from: ['/', '/swords/*', '/en', '/en/swords/*'],
      to: ['/swords/*', '/en/swords/*'],
      transition: hero({ type: 'fade', variant: 'smooth' }),
    },
  ],
};

/** 동작 줄이기를 켜면 화면 전환을 하지 않습니다. SSGOI는 이 설정을 스스로 읽지 않습니다. */
export const reducedConfig: SsgoiConfig = { transitions: [] };

export const selectConfig = (reduced: boolean) => (reduced ? reducedConfig : motionConfig);

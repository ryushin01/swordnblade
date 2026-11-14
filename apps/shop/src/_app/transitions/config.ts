import { LinearIntegrator, withOverride } from '@ssgoi/react';
import { fade, hero } from '@ssgoi/react/view-transitions';

import type { SsgoiConfig, Transition } from '@ssgoi/react';

// 설정 객체는 컴포넌트 밖에 둡니다. 렌더마다 새로 만들면 전환 엔진이 다시 만들어져 저장된 스크롤 위치를 잃습니다.

/** 카드 부조 → 상세의 큰 부조. 영어 주소(/en/...)는 규칙에 그대로 적습니다(middleware로 언어 접두어를 떼면
 * 언어를 바꿀 때 같은 화면끼리의 이동으로 보여, 떠나는 화면이 지워지지 않고 남습니다). */
const HERO_FROM = ['/', '/swords/*', '/en', '/en/swords/*'];
const HERO_TO = ['/swords/*', '/en/swords/*'];

/**
 * 규칙. 스크롤은 규칙이 정합니다(SSGOI 자동 정책).
 * - 나머지 이동은 `from: '/**', to: '/**'` 쌍 규칙의 fade. 새로 가는 화면은 맨 위에서 열고, 뒤로 가면 보던 자리로 돌아옵니다.
 *   `on: '/**'`로 두면 두 화면이 같은 범위 안이라 둘 다 처음 위치로 돌아가, 뒤로 가도 도검의 벽이 맨 위로 갔습니다.
 */
const rules = (transition: (kind: 'fade' | 'hero') => Transition) => [
  { priority: -100, from: '/**', to: '/**', transition: transition('fade') },
  { from: HERO_FROM, to: HERO_TO, transition: transition('hero') },
];

/**
 * 도검의 벽·함께 볼 도검·최근 본 도검의 카드를 누르면 카드의 부조(data-hero-exit-key)가
 * 상세 화면의 큰 부조(data-hero-enter-key)로 날아갑니다. 나머지 이동은 fade. 뒤로 가면 반대로 움직입니다.
 */
export const motionConfig: SsgoiConfig = {
  transitions: rules((kind) => (kind === 'hero' ? hero({ type: 'fade', variant: 'smooth' }) : fade())),
};

/** 한 프레임 안에 끝나는 전환. 움직임은 보이지 않고, 규칙의 스크롤 정책(뒤로 가면 보던 자리)은 그대로 씁니다. */
const instant = (transition: Transition) =>
  withOverride(transition, {
    forward: ({ animation }) => void animation.set({ integrator: new LinearIntegrator({ durationSec: 0.001 }) }),
    backward: ({ animation }) => void animation.set({ integrator: new LinearIntegrator({ durationSec: 0.001 }) }),
  });

/**
 * 동작 줄이기를 켜면 움직이지 않습니다. SSGOI는 이 설정을 스스로 읽지 않습니다.
 * 규칙을 비우면(transitions: []) 맞는 규칙이 없어 SSGOI가 들어오는 화면을 맨 위로 보내므로, 뒤로 가도
 * 보던 자리를 잃었습니다. 같은 규칙을 두고 전환만 즉시 끝나게 합니다.
 */
export const reducedConfig: SsgoiConfig = {
  transitions: rules((kind) => instant(kind === 'hero' ? hero({ type: 'fade' }) : fade())),
};

export const selectConfig = (reduced: boolean) => (reduced ? reducedConfig : motionConfig);

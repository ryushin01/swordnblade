import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Next.js 규칙에 따라 계층 이름을 _app, _pages로 씁니다.
    rules: { 'fsd/typo-in-layer-name': 'off' },
  },
  {
    // Next.js 라우트 폴더(src/app)는 FSD 계층이 아니라 _pages를 다시 내보내기만 합니다.
    ignores: ['src/app/**', '**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
  },
]);

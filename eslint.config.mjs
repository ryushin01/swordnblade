import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

/** 모노레포 전체에 하나의 설정을 씁니다. 각 패키지의 `pnpm lint`가 이 파일을 찾아 씁니다. */
const eslintConfig = [
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      '**/next-env.d.ts',
      '**/storybook-static/**',
      '**/public/storybook/**',
      '**/public/mockServiceWorker.js',
      '**/test-results/**',
      '**/playwright-report/**',
      '**/coverage/**',
      '**/.turbo/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Next.js 앱이 apps/ 아래에 있음을 알려 줍니다.
    settings: { next: { rootDir: ['apps/*/'] } },
    rules: {
      // Pages Router용 규칙입니다. 두 앱은 App Router만 쓰고, 쇼핑몰↔어드민(다른 zone) 이동은 일부러 a를 씁니다.
      // 실행 위치(루트·앱 폴더)에 따라 pages 폴더를 찾거나 못 찾아 결과가 달라지므로 끕니다.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    // import 순서: react → next → 외부 패키지 → 워크스페이스(@snb) → 앱 내부(@/) → 상대 경로 → import type → 사이드 이펙트(CSS)
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^react-dom', '^next', '^@?\\w'],
            ['^@snb/'],
            ['^@/'],
            ['^\\.'],
            ['^.*\\u0000$'],
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  // 서식 규칙을 끄는 설정이라 마지막에 둡니다.
  prettier,
];

export default eslintConfig;

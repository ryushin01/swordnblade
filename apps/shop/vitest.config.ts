import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      /** 단위·컴포넌트 테스트 (pnpm test, 커밋 전 검사) */
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'jsdom',
          env: { NEXT_PUBLIC_API_MOCKING: 'off' },
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          // next-intl이 next/navigation을 확장자 없이 불러와 Node가 못 찾으므로 Vite가 풀게 합니다.
          server: { deps: { inline: ['next-intl'] } },
        },
      },
      /**
       * 스토리 테스트 (pnpm test:storybook, CI)
       * 모든 스토리를 실제 브라우저(Chromium)에서 렌더링하고 접근성 검사(axe)를 실행합니다.
       */
      {
        plugins: [storybookTest({ configDir: '.storybook' })],
        resolve: { alias },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});

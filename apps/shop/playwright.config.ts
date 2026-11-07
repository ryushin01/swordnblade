import { defineConfig, devices } from '@playwright/test';

/** 배포된 사이트를 검사할 때는 E2E_BASE_URL을 주면 로컬 서버를 띄우지 않습니다. */
const BASE_URL = process.env.E2E_BASE_URL;
const PORT = Number(process.env.E2E_PORT ?? 3101);

/** 프로덕션 빌드(next start)를 띄워 검사합니다. 먼저 `pnpm build`가 필요합니다. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: BASE_URL ?? `http://localhost:${PORT}`, trace: 'retain-on-failure', locale: 'ko-KR' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: BASE_URL
    ? undefined
    : {
        command: `next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});

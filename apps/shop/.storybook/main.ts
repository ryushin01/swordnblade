import type { StorybookConfig } from '@storybook/nextjs-vite';

/**
 * 빌드 결과물은 public/storybook에 만들어져 앱과 함께 배포됩니다.
 * public 전체를 staticDirs로 지정하면 빌드 결과물이 다시 복사되므로 지정하지 않습니다.
 */
const config: StorybookConfig = {
  framework: '@storybook/nextjs-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  core: { disableTelemetry: true },
};

export default config;

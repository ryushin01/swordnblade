import { App, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';

import type { Preview } from '@storybook/nextjs-vite';

const preview: Preview = {
  // 접근성 위반이 있으면 스토리 테스트를 실패로 처리합니다.
  parameters: { layout: 'centered', nextjs: { appDirectory: true }, a11y: { test: 'error' } },
  decorators: [
    (Story) => (
      <ConfigProvider
        locale={koKR}
        theme={{
          token: {
            colorPrimary: '#0958d9',
            colorLink: '#0958d9',
            colorError: '#cf1322',
            colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
          },
        }}
      >
        <App>
          <div lang="ko">
            <Story />
          </div>
        </App>
      </ConfigProvider>
    ),
  ],
};

export default preview;

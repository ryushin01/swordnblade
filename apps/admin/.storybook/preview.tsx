import type { Preview } from '@storybook/nextjs-vite';
import { App, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';

const preview: Preview = {
  parameters: { layout: 'centered', nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <ConfigProvider locale={koKR} theme={{ token: { colorPrimary: '#0958d9', colorLink: '#0958d9', colorTextSecondary: 'rgba(0, 0, 0, 0.65)' } }}>
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

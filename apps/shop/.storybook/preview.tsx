import type { Preview } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/_app/styles/globals.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wall', values: [{ name: 'wall', value: '#dddcd7' }] },
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div lang="ko" style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif" }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default preview;

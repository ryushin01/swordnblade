import type { NextConfig } from 'next';

/**
 * 어드민 앱 주소. /admin 요청을 이 주소로 넘겨 같은 출처에서 어드민을 엽니다(Next.js multi-zones).
 * 빌드할 때 정해지며, 로컬 E2E처럼 다른 어드민 서버를 쓸 때는 ADMIN_ORIGIN으로 바꿉니다.
 */
const ADMIN_ORIGIN =
  process.env.ADMIN_ORIGIN ??
  (process.env.NODE_ENV === 'production' ? 'https://swordnblade-admin.vercel.app' : 'http://localhost:3001');

const nextConfig: NextConfig = {
  transpilePackages: ['@snb/domain', '@snb/mocks', '@snb/sword-art'],
  reactStrictMode: true,
  async redirects() {
    // public/storybook 폴더 주소로 들어오면 Storybook 첫 화면으로 보냅니다.
    // 재작성(rewrite)하면 주소가 /storybook으로 남아 Storybook의 상대 경로 파일을 못 찾으므로 주소를 바꿉니다.
    return [{ source: '/storybook', destination: '/storybook/index.html', permanent: false }];
  },
  async rewrites() {
    return [
      { source: '/admin', destination: `${ADMIN_ORIGIN}/admin` },
      { source: '/admin/:path*', destination: `${ADMIN_ORIGIN}/admin/:path*` },
    ];
  },
};

export default nextConfig;

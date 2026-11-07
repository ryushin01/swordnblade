import type { NextConfig } from 'next';

/**
 * 어드민은 쇼핑몰 주소의 /admin 아래에서 열립니다(Next.js multi-zones).
 * 쇼핑몰이 /admin 요청을 이 앱으로 넘기므로, 두 앱이 같은 출처(origin)를 써서
 * 브라우저에 저장한 Mock 데이터와 MSW 서비스 워커를 함께 씁니다.
 */
const nextConfig: NextConfig = {
  basePath: '/admin',
  transpilePackages: ['@snb/domain', '@snb/mocks', '@snb/sword-art'],
  reactStrictMode: true,
  async headers() {
    // 어드민만 따로 열렸을 때 워커가 /admin(끝 슬래시 없음) 화면까지 맡을 수 있게 범위를 넓힙니다.
    return [{ source: '/mockServiceWorker.js', headers: [{ key: 'Service-Worker-Allowed', value: '/admin' }] }];
  },
  async redirects() {
    // 어드민 단독 주소로 들어오면 /admin으로 보냅니다.
    return [{ source: '/', destination: '/admin', basePath: false, permanent: false }];
  },
};

export default nextConfig;

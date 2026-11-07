import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@snb/domain', '@snb/mocks', '@snb/sword-art'],
  reactStrictMode: true,
};

export default nextConfig;

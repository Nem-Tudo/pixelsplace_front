/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://n2.enigmaa.me:25616/:path*',
      },
    ];
  },
};

export default nextConfig;

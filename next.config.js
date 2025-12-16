/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'encrypted-media=*',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['i1.sndcdn.com'],
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // No `output: 'standalone'` here on purpose: that's for self-hosting, and it
  // breaks Vercel's own packaging step (onBuildComplete) on Next 16.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:3000 https://cambaughn.com;"
          }
        ],
      },
    ]
  },
};

export default nextConfig;

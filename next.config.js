/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[1] === 'live' ? 'com' : 'dev'} https://*.clerk.accounts.dev;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: blob:;
              font-src 'self' data:;
              connect-src 'self' https://*.clerk.accounts.dev https://clerk.${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[1] === 'live' ? 'com' : 'dev'} https://*.supabase.co https://api.openai.com;
              frame-src 'self' https://*.clerk.accounts.dev;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ]
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Enable React strict mode for better error handling
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Production optimizations
  swcMinify: true,
}

module.exports = nextConfig

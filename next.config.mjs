import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const ContentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-eval' and 'unsafe-inline' allow Next.js hydration, dynamic chunks, and PWA runtime without eval errors
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https: wss:",
  "media-src 'self' blob: data: https:",
  "frame-src 'self' https://meet.jit.si",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // next/image optimisation is ON by default (unoptimized: false).
    // Allow common remote image hosts if needed later via remotePatterns.
    remotePatterns: [],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withPWA(nextConfig);

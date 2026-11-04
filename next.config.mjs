import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // next/image optimisation is ON by default (unoptimized: false).
    // Allow common remote image hosts if needed later via remotePatterns.
    remotePatterns: [],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // No custom CSP headers here — middleware handles security headers.
  // next/image will auto-optimise PNGs in public/ when served via <Image>.
};

export default withPWA(nextConfig);

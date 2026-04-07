import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  // NOTE: Moving `turbopack` config from experimental to root based on build errors
  // Next 16 moves turbopack out of experimental, but using it here causes type error
  // so we type assert
  turbopack: {}
} as NextConfig & { turbopack?: any };

export default withPWA(nextConfig);

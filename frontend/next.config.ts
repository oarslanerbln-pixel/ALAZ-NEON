import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  turbopack: {}, // Add empty turbopack configuration to bypass custom webpack injection errors from next-pwa
  // Any other next config options go here
};

export default withPWA(nextConfig);

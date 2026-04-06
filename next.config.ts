import type { NextConfig } from "next";
const withPWA = require('next-pwa');

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {} // next-pwa ile Turbopack (Next 16+) uyuşmazlığı hatasını bastırmak için eklendi.
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWAConfig(nextConfig);

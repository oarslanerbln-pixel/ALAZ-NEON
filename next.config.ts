import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // using empty turbo object as suggested by next-pwa next15 compatibility issue memory/docs
  },
  turbopack: {} // Setting turbopack empty config as per error log suggestion
};

export default withPWA(nextConfig);

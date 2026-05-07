import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Turbopack is no longer under experimental in Next.js 15+
};

export default withPWA(nextConfig as unknown as Record<string, unknown>);

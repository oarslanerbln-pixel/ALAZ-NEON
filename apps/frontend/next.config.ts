import type { NextConfig } from "next";

/* eslint-disable @typescript-eslint/no-explicit-any */
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig as any);

declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    // add other config options as needed
    [key: string]: any;
  }

  export default function withPWAInit(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}

declare module 'next-pwa' {
  import { NextConfig } from 'next'

  export default function withPWA(
    pluginOptions: Record<string, unknown>
  ): (nextConfig?: NextConfig) => NextConfig
}

declare module "next-pwa" {
  import { NextConfig } from "next";

  export default function withPWA(config: {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: (RegExp | string)[];
    publicExcludes?: (RegExp | string)[];
    [key: string]: unknown;
  }): (nextConfig: NextConfig) => NextConfig;
}

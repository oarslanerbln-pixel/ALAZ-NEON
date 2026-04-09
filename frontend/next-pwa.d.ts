declare module "next-pwa" {
  export default function withPWA(
    pwaConfig: Record<string, unknown>
  ): (nextConfig: Record<string, unknown>) => Record<string, unknown>;
}

declare module 'next-pwa' {
  const withPWA: (config: Record<string, unknown>) => (nextConfig: Record<string, unknown>) => Record<string, unknown>;
  export default withPWA;
}
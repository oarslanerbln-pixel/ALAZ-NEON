/* eslint-disable @typescript-eslint/no-explicit-any */
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
});

const nextConfig = {
  /* config options here */
  turbopack: {},
};

export default withPWA(nextConfig) as any;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Suppress Turbopack warnings by specifying an empty object if no complex loaders are used
  }
};

export default nextConfig;

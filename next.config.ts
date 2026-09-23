import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable standalone output on non-Windows (Docker/Linux) or when explicitly requested
  // to prevent Windows/OneDrive EINVAL readlink symlink errors during local builds
  output: process.platform === "win32" && !process.env.FORCE_STANDALONE ? undefined : "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
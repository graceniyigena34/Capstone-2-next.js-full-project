import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Fix lockfile warning by explicitly setting the workspace root
  experimental: {
    turbopack: {
      root: path.resolve(process.cwd()),
    },
  },
};

export default nextConfig;

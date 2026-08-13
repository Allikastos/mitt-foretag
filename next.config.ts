import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_LOCAL_DIST_DIR ?? ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;

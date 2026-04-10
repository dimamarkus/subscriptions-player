import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.bcbits.com",
      },
    ],
  },
};

export default nextConfig;

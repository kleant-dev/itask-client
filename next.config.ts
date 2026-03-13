import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://localhost:7001/api/:path*",
      },
      {
        source: "/hubs/:path*",
        destination: "https://localhost:7001/hubs/:path*",
      },
    ];
  },
};

export default nextConfig;

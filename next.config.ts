import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.111:3000"],
};

module.exports = {
  allowedDevOrigins: ["192.168.8.111"],
};

export default nextConfig;

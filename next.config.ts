import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.8.111:3000",
    "192.168.8.111",
    "http://172.20.10.13:3000",
    "172.20.10.13:3000",
    "172.20.10.13",
  ],
};

module.exports = {
  allowedDevOrigins: ["192.168.8.111", "172.20.10.13"],
};

export default nextConfig;

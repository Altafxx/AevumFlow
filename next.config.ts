import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10GB",
      allowedOrigins: [
        "localhost:3000",
        "app:3000"
      ],
    }
  }
};

export default nextConfig;

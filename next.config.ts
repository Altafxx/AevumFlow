import allowedOrigins from "@/lib/next-config/allowed-origin";
import allowedRemotePattern from "@/lib/next-config/allowed-remote-pattern";
import type { NextConfig } from "next";
import { RemotePattern } from "next/dist/shared/lib/image-config";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
      allowedOrigins: allowedOrigins() as string[],
    },
  },
  serverExternalPackages: ["fluent-ffmpeg"],
  images: {
    remotePatterns: allowedRemotePattern() as RemotePattern[],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  env: {
    LOCALHOST: process.env.LOCALHOST || 'false',
  },
};

export default nextConfig;

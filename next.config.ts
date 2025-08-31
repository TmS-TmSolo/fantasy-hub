import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true }, // fine for now
  typescript: {
    // Fail builds only in Production. Previews/Dev bypass.
    ignoreBuildErrors: process.env.VERCEL_ENV !== "production",
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.tailg.pe",
      },
      {
        protocol: "https",
        hostname: "tailg.pe",
      },
      {
        protocol: "https",
        hostname: "www.greenline.pe",
      },
      {
        protocol: "https",
        hostname: "greenline.pe",
      },
      {
        protocol: "https",
        hostname: "yadea.com.pe",
      },
      {
        protocol: "https",
        hostname: "www.yadea.com.pe",
      },
      {
        protocol: "https",
        hostname: "kayencorp.com",
      },
      {
        protocol: "https",
        hostname: "www.kayencorp.com",
      },
    ],
  },
};

export default nextConfig;

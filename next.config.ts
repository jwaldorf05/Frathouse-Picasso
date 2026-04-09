import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;

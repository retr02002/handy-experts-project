import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The dev indicator's portal intercepts clicks across the page (including
  // our full-width mobile checkout action bar), even after repositioning it.
  // Dev-only cosmetic feature — disabling it has no effect on production.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;

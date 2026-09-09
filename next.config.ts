import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The dev indicator's portal intercepts clicks across the page (including
  // our full-width mobile checkout action bar), even after repositioning it.
  // Dev-only cosmetic feature — disabling it has no effect on production.
  devIndicators: false,
  experimental: {
    // Barrel-file imports pull far more than what's used. @iconify/react is
    // imported (via ClientIcon) in ~157 files, so this is the highest-value
    // entry here; recharts and framer-motion are the other two big barrels.
    optimizePackageImports: ["@iconify/react", "recharts", "framer-motion"],
  },
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

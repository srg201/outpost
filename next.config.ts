import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // `next dev` only serves its JS/HMR to localhost by default. Allow devices on
  // the local network (e.g. testing on a phone via http://192.168.x.x:3000).
  // Development only; has no effect on production builds.
  allowedDevOrigins: ["192.168.*.*"],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

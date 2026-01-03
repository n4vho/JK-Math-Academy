import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable more verbose error messages in production for debugging
  // Remove this in production if you don't want detailed errors
  onDemandEntries: {
    // Keep pages in memory for longer to help with debugging
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Log more details about errors
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This app is client-heavy (session cookie, i18n shell, pathname-driven
  // chrome), so the strict cache-components prerender mode is not used.
  cacheComponents: false,
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

import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,

  runtimeCaching: [
    {
      urlPattern: ({ request }: { request: Request }) =>
        request.destination === "document",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],

  fallbacks: {
    document: "/",
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);

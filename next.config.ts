import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,

  // 🔥 超重要：App Router 対策
  cacheStartUrl: true,
  dynamicStartUrl: true,

  runtimeCaching: [
    // =========================
    // ページHTML（超重要）
    // =========================
    {
      urlPattern: ({ request }: { request: Request }) =>
        request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },

    // =========================
    // 静的ファイル
    // =========================
    {
      urlPattern: /^https?.*\.(js|css|png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
  ],

  // 🔥 オフラインフォールバック
  fallbacks: {
    document: "/",
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);

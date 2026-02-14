import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // ★まず強制ONで確認（重要）
});

const nextConfig: NextConfig = {
  turbopack: {}, // ← これも必須
};

export default withPWA(nextConfig);

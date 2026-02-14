import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallBanner from "@/app/components/InstallBanner";
import ServiceWorkerRegister from "@/app/components/ServiceWorkerRegister"; // ★追加

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "整備士ポータル",
  description: "整備士向けポータル",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* ★ Service Worker 登録（超重要） */}
        <ServiceWorkerRegister />

        {/* ★ インストールバナー */}
        <InstallBanner />
      </body>
    </html>
  );
}


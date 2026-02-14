"use client"

import { useEffect, useState } from "react"

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase()

    const ios =
      /iphone|ipad|ipod/.test(ua)

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS用
      (window.navigator as any).standalone === true

    setIsIOS(ios)
    setIsStandalone(standalone)

    // 一度閉じたら再表示しない
    const dismissed = localStorage.getItem("pwa-banner-dismissed")
    if (dismissed) return

    // iOSは常に案内表示（ただしstandalone除く）
    if (ios && !standalone) {
      setVisible(true)
      return
    }

    // Android系
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleClose = () => {
    localStorage.setItem("pwa-banner-dismissed", "1")
    setVisible(false)
  }

  // PWA起動中は出さない
  if (!visible || isStandalone) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-black text-white rounded-2xl p-4 shadow-xl">
        {/* ===== iOS ===== */}
        {isIOS ? (
          <div className="text-sm">
            <div className="font-bold mb-1">
              📱 ホーム画面に追加できます
            </div>
            <div className="text-xs opacity-90">
              ① 画面下の「共有」→  
              ②「ホーム画面に追加」
            </div>
          </div>
        ) : (
          /* ===== Android ===== */
          <div className="flex items-center justify-between">
            <div className="text-sm">
              📱 ホーム画面に追加するとすぐ開けます
            </div>

            <button
              onClick={handleInstallClick}
              className="ml-3 bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
            >
              追加
            </button>
          </div>
        )}

        {/* 閉じる */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-xs opacity-70"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
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

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-black text-white rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="text-sm">
          📱 ホーム画面に追加すると便利に使えます
        </div>
        <button
          onClick={handleInstallClick}
          className="ml-3 bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
        >
          追加
        </button>
      </div>
    </div>
  )
}

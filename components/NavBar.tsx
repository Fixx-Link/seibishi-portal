"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NavBar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`

  return (
    <nav className="w-full border-b bg-white px-6 py-3 flex gap-2">
      <Link href="/jobs" className={linkClass("/jobs")}>
        マイ案件
      </Link>
      <Link href="/rewards" className={linkClass("/rewards")}>
        報酬確認
      </Link>
      <Link href="/account" className={linkClass("/account")}>
        アカウント
      </Link>
    </nav>
  )
}

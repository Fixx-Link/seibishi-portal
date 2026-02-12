"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function LoginPage() {
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("ログイン失敗：" + error.message)
      setLoading(false)
      return
    }

    router.push("/jobs")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-gray-200 to-gray-300 px-4">
      
      <div className="bg-white p-10 rounded-2xl shadow-2xl 
                      w-full max-w-md border border-gray-200">

        <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">
          整備士ポータル ログイン
        </h1>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-gray-800">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 
                       bg-gray-50
                       border border-gray-400
                       rounded-lg
                       text-gray-900
                       focus:outline-none 
                       focus:ring-2 
                       focus:ring-blue-500
                       focus:border-blue-500
                       transition"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-800">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 
                       bg-gray-50
                       border border-gray-400
                       rounded-lg
                       text-gray-900
                       focus:outline-none 
                       focus:ring-2 
                       focus:ring-blue-500
                       focus:border-blue-500
                       transition"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 
                     rounded-lg font-semibold text-lg
                     hover:bg-blue-700 
                     shadow-md
                     transition disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center font-medium">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { redirect } from "next/navigation"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ⭐ await をつけるのが正解
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow">
        <nav className="flex gap-6 text-sm font-semibold">
          <Link href="/jobs" className="hover:text-blue-400 transition">
            マイ案件
          </Link>
          <Link href="/rewards" className="hover:text-blue-400 transition">
            報酬確認
          </Link>
          <Link href="/account" className="hover:text-blue-400 transition">
            アカウント情報
          </Link>
        </nav>

        <form action="/auth/signout" method="post">
          <button className="text-sm underline hover:text-red-400 transition">
            ログアウト
          </button>
        </form>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

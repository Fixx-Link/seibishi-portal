import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getMechanicByEmail } from "@/lib/notion/mechanics"
import { logout } from "@/app/logout/actions"

export default async function AccountPage() {
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

  const email = user?.email
  if (!email) return <div className="p-6">ユーザー情報が取得できません</div>

  const mechanic = await getMechanicByEmail(email)
  if (!mechanic) return <div className="p-6">整備士情報が見つかりません</div>

  // 🔥 ここが重要：Notionの型をページだと強制
  const p = (mechanic as any).properties

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-bold mb-4">アカウント情報</h1>

      <p>
       🆔 整備士ID:{" "}
      {p["整備士ID"]?.unique_id
      ? `${p["整備士ID"].unique_id.prefix ?? ""}${p["整備士ID"].unique_id.number}`
      : "-"}
     </p>
      <p>👤 名前: {p["名前"]?.title?.[0]?.plain_text ?? "-"}</p>
      <p>🏠 住所: {p["住所のみ"]?.rich_text?.[0]?.plain_text ?? "-"}</p>
      <p>📮 郵便番号: {p["郵便番号"]?.rich_text?.[0]?.plain_text ?? "-"}</p>
      <p>📞 電話番号: {p["電話番号"]?.phone_number ?? "-"}</p>
      <p>📧 メール: {p["メールアドレス"]?.email ?? "-"}</p>

      <hr className="my-4" />

      <p>🏦 銀行名: {p["口座(銀行名)"]?.rich_text?.[0]?.plain_text ?? "-"}</p>
      <p>🏢 支店名: {p["口座(支店名)"]?.rich_text?.[0]?.plain_text ?? "-"}</p>
      <p>🔢 口座番号: {p["口座(口座番号)"]?.rich_text?.[0]?.plain_text ?? "-"}</p>
      <p>👤 名義: {p["口座(名義)"]?.rich_text?.[0]?.plain_text ?? "-"}</p>
      <p>🧾 適格事業者番号: {p["適格請求書発行事業者番号"]?.rich_text?.[0]?.plain_text ?? "-"}</p>
      <p>📋 BS登録: {p["BS登録"]?.status?.name ?? "-"}</p>

      <form action={logout} className="mt-10">
        <button
          type="submit"
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          ログアウト
        </button>
      </form>
    </div>
  )
}

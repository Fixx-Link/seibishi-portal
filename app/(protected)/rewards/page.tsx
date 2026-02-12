import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getCompletedJobsByEmail } from "@/lib/notion/jobs"

/* ------------------------------
   🔥 日付フォーマット（UTCズレ防止）
------------------------------ */
function formatDateOnly(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getMonthRange(offset = 0) {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)

  const start = new Date(target.getFullYear(), target.getMonth(), 1)
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0)

  return {
    label: `${target.getFullYear()}年${target.getMonth() + 1}月`,
    start: formatDateOnly(start),
    end: formatDateOnly(end),
  }
}

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
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
  if (!email) return <div className="p-6">ログイン情報が取得できません</div>

  const months = [getMonthRange(0), getMonthRange(-1), getMonthRange(-2)]

  const selected =
    months.find((m) => m.label === params?.month) ?? months[0]

  const jobs = await getCompletedJobsByEmail(
    email,
    selected.start,
    selected.end
  )

  /* ------------------------------
     🔹 共通ヘルパー
  ------------------------------ */

  const text = (field: any) =>
    field?.rich_text?.[0]?.plain_text ??
    field?.title?.[0]?.plain_text ??
    "-"

  const number = (field: any) => field?.number ?? 0

  // 🔥 unique_id対応（#なし）
  const uniqueId = (field: any) =>
    field?.unique_id?.number ?? "-"

  // 🔥 ロールアップ安全取得
  const rollupTitle = (field: any) =>
    field?.rollup?.array?.[0]?.title?.[0]?.plain_text ??
    field?.rollup?.array?.[0]?.rich_text?.[0]?.plain_text ??
    "-"

  const formatDisplayDate = (iso: string | undefined) => {
    if (!iso) return "-"
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  /* ------------------------------
     🔥 月合計計算
  ------------------------------ */
  let total = 0
  jobs.forEach((job: any) => {
    const p = job.properties ?? {}
    const reward = number(p["整備士報酬(税込)"])
    const travel = number(p["交通費(税込)"])
    const cost = p["立替代(税込)"]?.formula?.number ?? 0
    total += reward + travel + cost
  })

  return (
    <div className="p-4 max-w-full">
      <h1 className="text-2xl font-bold mb-4">報酬確認</h1>

      {/* 月タブ */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {months.map((m) => (
          <a
            key={m.label}
            href={`/rewards?month=${encodeURIComponent(m.label)}`}
            className={`px-4 py-2 rounded-lg border text-sm ${
              m.label === selected.label
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {m.label}
          </a>
        ))}
      </div>

      {/* 合計表示 */}
      <div className="bg-black text-white rounded-xl p-6 mb-6 shadow-lg">
        <p className="text-sm opacity-70">総支払額</p>
        <p className="text-3xl font-bold mt-2">
          ¥{total.toLocaleString()}
        </p>
      </div>

      {jobs.length === 0 && (
        <p className="text-gray-500">
          この月の報酬データはありません
        </p>
      )}

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full text-sm border">
          <thead className="bg-gray-100 text-xs">
            <tr>
              <th className="p-2 border">作業日</th>
              <th className="p-2 border">案件ID</th>
              <th className="p-2 border">顧客名</th>
              <th className="p-2 border">受注チャネル</th>
              <th className="p-2 border">ナンバー</th>
              <th className="p-2 border">初度登録</th>
              <th className="p-2 border">型式</th>
              <th className="p-2 border">車両情報</th>
              <th className="p-2 border">総指数</th>
              <th className="p-2 border">管理No</th>
              <th className="p-2 border">備考</th>
              <th className="p-2 border text-right">報酬</th>
              <th className="p-2 border text-right">交通費</th>
              <th className="p-2 border text-right">立替</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job: any) => {
              const p = job.properties ?? {}

              const reward = number(p["整備士報酬(税込)"])
              const travel = number(p["交通費(税込)"])
              const cost = p["立替代(税込)"]?.formula?.number ?? 0

              return (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {formatDisplayDate(p["作業日"]?.date?.start)}
                  </td>

                  {/* ✅ unique_id 正式対応 */}
                  <td className="p-2 border">
                    {uniqueId(p["案件ID"])}
                  </td>

                  <td className="p-2 border">
                    {text(p["顧客名(正式)"])}
                  </td>

                  {/* ✅ ロールアップ表示 */}
                  <td className="p-2 border">
                    {rollupTitle(p["受注チャネルロールアップ"])}
                  </td>

                  <td className="p-2 border">
                    {text(p["自動車登録番号（ナンバー）"])}
                  </td>

                  <td className="p-2 border">
                    {text(p["初度登録年月"])}
                  </td>

                  <td className="p-2 border">
                    {text(p["型式"])}
                  </td>

                  <td className="p-2 border">
                    {text(p["車両情報"])}
                  </td>

                  <td className="p-2 border">
                    {text(p["総指数(ディーラー案件用)"])}
                  </td>

                  <td className="p-2 border">
                    {text(p["先方管理No."])}
                  </td>

                  <td className="p-2 border">
                    {text(p["備考(整備士)"])}
                  </td>

                  <td className="p-2 border text-right">
                    ¥{reward.toLocaleString()}
                  </td>

                  <td className="p-2 border text-right">
                    ¥{travel.toLocaleString()}
                  </td>

                  <td className="p-2 border text-right">
                    ¥{cost.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

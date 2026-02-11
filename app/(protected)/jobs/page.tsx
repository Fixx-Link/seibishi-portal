import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getMyActiveJobs } from "@/lib/notion/jobs"

export default async function JobsPage() {
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

  if (!email) {
    return <div className="p-6">ユーザー情報が取得できませんでした</div>
  }

  const jobs = await getMyActiveJobs(email)

  const text = (field: any) =>
    field?.rich_text?.[0]?.plain_text ?? "-"

  const number = (field: any) =>
    field?.number ?? "-"

  const statusColor = (status: string) => {
    if (status === "スタンバイ")
      return "bg-yellow-100 text-yellow-800"
    if (status === "不具合発生中")
      return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-700"
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">マイ案件一覧</h1>

      {jobs.length === 0 && (
        <p className="text-gray-500">現在案件はありません</p>
      )}

      <div className="space-y-4">
        {jobs.map((job: any) => {
          const p = job.properties

          const date = p["作業日"]?.date?.start ?? "-"
          const place = text(p["顧客住所(正式)"])
          const car = text(p["車種"])
          const reward = number(p["整備士報酬(税込)"])
          const travel = number(p["交通費(税込)"])
          const status = p["作業ステータス"]?.status?.name ?? "-"

          return (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <div className="border rounded-xl p-4 shadow hover:shadow-md transition bg-white active:scale-[0.99]">

                {/* 上段 */}
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-500">{date}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusColor(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                {/* メイン情報 */}
                <p className="font-semibold text-lg mb-1">
                  📍 {place}
                </p>

                <p className="text-gray-700 mb-2">
                  🚗 {car}
                </p>

                {/* 金額 */}
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <p>報酬: ¥{reward}</p>
                  <p>交通費: ¥{travel}</p>
                </div>

                <p className="text-xs text-blue-500 mt-2">
                  詳細を見る →
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

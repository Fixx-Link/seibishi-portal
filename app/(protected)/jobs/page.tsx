import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getMyActiveJobs } from "@/lib/notion/jobs"

export default async function JobsPage() {
  // ✅ ここは await 必須
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">マイ案件一覧</h1>

      {jobs.length === 0 && (
        <p className="text-gray-500">現在案件はありません</p>
      )}

      <div className="grid gap-4">
        {jobs.map((job: any) => {
          const p = job.properties

          const date = p["作業日"]?.date?.start ?? "-"
          const place =
            p["顧客住所(正式)"]?.rich_text?.[0]?.plain_text ?? "-"
          const car =
            p["車種"]?.rich_text?.[0]?.plain_text ?? "-"
          const reward = p["整備士報酬(税込)"]?.number ?? "-"
          const travel = p["交通費(税込)"]?.number ?? "-"

          return (
            <div key={job.id} className="border rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500">{date}</p>
              <p>📍 {place}</p>
              <p>🚗 {car}</p>
              <p>報酬: ¥{reward}</p>
              <p>交通費: ¥{travel}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

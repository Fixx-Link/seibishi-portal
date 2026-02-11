import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getCompletedJobsByEmail } from "@/lib/notion/jobs"

function getMonthRange(offset = 0) {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)

  const start = new Date(target.getFullYear(), target.getMonth(), 1)
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0)

  return {
    label: `${target.getFullYear()}年${target.getMonth() + 1}月`,
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export default async function RewardsPage({
  searchParams,
}: {
  searchParams?: { month?: string }
}) {
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
    months.find((m) => m.label === searchParams?.month) ?? months[0]

  const jobs = await getCompletedJobsByEmail(email, selected.start, selected.end)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">報酬確認</h1>

      {/* 月タブ */}
      <div className="flex gap-2 mb-6">
        {months.map((m) => (
          <a
            key={m.label}
            href={`/rewards?month=${encodeURIComponent(m.label)}`}
            className={`px-4 py-2 rounded-lg border ${
              m.label === selected.label ? "bg-black text-white" : ""
            }`}
          >
            {m.label}
          </a>
        ))}
      </div>

      {jobs.length === 0 && (
        <p className="text-gray-500">この月の報酬データはありません</p>
      )}

      <div className="grid gap-4">
        {jobs.map((job: any) => {
          const p = (job as any).properties ?? {}

          const date = p["作業日"]?.date?.start ?? "-"
          const id = p["案件ID"]?.number ?? "-"
          const customer =
            p["顧客名(正式)"]?.rich_text?.[0]?.plain_text ?? "-"
          const reward = p["整備士報酬(税込)"]?.number ?? 0
          const travel = p["交通費(税込)"]?.number ?? 0
          const cost = p["立替代(税込)"]?.formula?.number ?? 0

          return (
            <div key={job.id} className="border rounded-lg p-4 shadow">
              <p className="text-sm text-gray-500">{date}</p>
              <p>案件ID: {id}</p>
              <p>顧客名: {customer}</p>
              <p>報酬: ¥{reward.toLocaleString()}</p>
              <p>交通費: ¥{travel.toLocaleString()}</p>
              <p>立替代: ¥{cost.toLocaleString()}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

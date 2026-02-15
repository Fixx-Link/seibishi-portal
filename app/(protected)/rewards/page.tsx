import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getCompletedJobsByEmail } from "@/lib/notion/jobs"
import { getMechanicByEmail } from "@/lib/notion/mechanics"
import MonthSelector from "@/components/MonthSelector"

/* ------------------------------ */
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

  if (!user?.email) {
    return <div className="p-6">ログイン情報が取得できません</div>
  }

  const months = Array.from({ length: 24 }).map((_, i) =>
    getMonthRange(-i)
  )

  const selected =
    months.find((m) => m.label === params?.month) ?? months[0]

  const jobs = await getCompletedJobsByEmail(
    user.email,
    selected.start,
    selected.end
  )

  const mechanic = await getMechanicByEmail(user.email)
  const mechanicPage = mechanic as any

  const invoiceNumber =
    mechanicPage?.properties?.["適格請求書発行事業者番号"]
      ?.rich_text?.[0]?.plain_text?.trim() ?? ""

  const isInvoiceRegistered = invoiceNumber.length > 0

  const numberField = (field: any) =>
    field?.number ?? field?.formula?.number ?? 0

  const text = (field: any) =>
    field?.rich_text?.[0]?.plain_text ??
    field?.title?.[0]?.plain_text ??
    "-"

  const uniqueId = (field: any) =>
    field?.unique_id?.number ?? "-"

  const rollupTitle = (field: any) =>
    field?.rollup?.array?.[0]?.title?.[0]?.plain_text ??
    field?.rollup?.array?.[0]?.rich_text?.[0]?.plain_text ??
    "-"

  const formatDisplayDate = (iso: string | undefined) => {
    if (!iso) return "-"
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  let rewardTotal = 0
  let travelTotal = 0
  let costTotal = 0

  jobs.forEach((job: any) => {
    const p = job.properties ?? {}
    rewardTotal += numberField(p["整備士報酬(税込)"])
    travelTotal += numberField(p["交通費(税込)"])
    costTotal += numberField(p["立替代(税込)"])
  })

  const taxableTotal = rewardTotal + travelTotal
  const taxExcluded = Math.floor(taxableTotal / 1.1)
  const taxAmount = taxableTotal - taxExcluded
  const deduction = isInvoiceRegistered
    ? 0
    : Math.floor(taxAmount * 0.2)

  const finalPayment = taxableTotal - deduction + costTotal

  return (
    <div className="p-4 max-w-full">
      <h1 className="text-2xl font-bold mb-4">報酬確認</h1>

      <MonthSelector months={months} selected={selected.label} />

      <div className="mb-6">
        <a
          href={`/api/rewards-csv?month=${encodeURIComponent(
            selected.label
          )}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          この月をCSV出力
        </a>
      </div>

      <div className="bg-black text-white rounded-xl p-6 mb-6 shadow-lg">
        <p className="text-sm opacity-70">予定支払額</p>
        <p className="text-3xl font-bold mt-2">
          ¥{finalPayment.toLocaleString()}
        </p>
      </div>

      {/* 🔥 内訳表示 復活 */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6 text-sm">
      <p>税込合計（報酬＋交通費）：¥{taxableTotal.toLocaleString()}</p>
      <p>税抜金額：¥{taxExcluded.toLocaleString()}</p>
      <p>消費税：¥{taxAmount.toLocaleString()}</p>

      {!isInvoiceRegistered && (
      <p className="text-red-600">
      免税事業者調整：-¥{deduction.toLocaleString()}
      </p>
      )}

  {isInvoiceRegistered && (
    <p className="text-green-600">
      ※インボイス登録済みのため調整なし
    </p>
  )}

  <p>立替（非課税）：¥{costTotal.toLocaleString()}</p>
  <p className="font-bold mt-2">
    支払予定額：¥{finalPayment.toLocaleString()}
  </p>
</div>


      <div className="overflow-x-auto">
  <table className="min-w-[1400px] w-full text-sm border">
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

        const reward = numberField(p["整備士報酬(税込)"])
        const travel = numberField(p["交通費(税込)"])
        const cost = numberField(p["立替代(税込)"])

        return (
          <tr key={job.id}>
            <td className="p-2 border">
              {p["作業日"]?.date?.start ?? "-"}
            </td>
            <td className="p-2 border">
              {p["案件ID"]?.unique_id?.number ?? "-"}
            </td>
            <td className="p-2 border">
              {text(p["顧客名(正式)"])}
            </td>
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


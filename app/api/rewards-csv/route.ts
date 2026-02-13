import { NextRequest } from "next/server"
import { getCompletedJobsByEmail } from "@/lib/notion/jobs"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    /* ------------------ 認証 ------------------ */
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
      return new Response("Unauthorized", { status: 401 })
    }

    /* ------------------ 月パラメータ ------------------ */
    const monthLabel = req.nextUrl.searchParams.get("month")
    if (!monthLabel) {
      return new Response("Month required", { status: 400 })
    }

    const match = monthLabel.match(/(\d+)年(\d+)月/)
    if (!match) {
      return new Response("Invalid month format", { status: 400 })
    }

    const year = Number(match[1])
    const month = Number(match[2]) - 1

    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)

    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)

    /* ------------------ Notionデータ取得 ------------------ */
    const jobs = await getCompletedJobsByEmail(
      user.email,
      startStr,
      endStr
    )

    /* ------------------ ユーティリティ ------------------ */

    const numberField = (field: any) =>
      field?.number ?? field?.formula?.number ?? 0

    const textField = (field: any) =>
      field?.rich_text?.[0]?.plain_text ??
      field?.title?.[0]?.plain_text ??
      ""

    const rollupField = (field: any) =>
      field?.rollup?.array?.[0]?.title?.[0]?.plain_text ??
      field?.rollup?.array?.[0]?.rich_text?.[0]?.plain_text ??
      ""

    /* ------------------ CSV生成（画面と完全一致） ------------------ */

    const header = [
      "作業日",
      "案件ID",
      "顧客名",
      "受注チャネル",
      "ナンバー",
      "初度登録",
      "型式",
      "車両情報",
      "総指数",
      "管理No",
      "備考",
      "報酬(税込)",
      "交通費(税込)",
      "立替(税込)",
    ]

    const rows = jobs.map((job: any) => {
      const p = job.properties ?? {}

      return [
        p["作業日"]?.date?.start ?? "",
        p["案件ID"]?.unique_id?.number ?? "",
        textField(p["顧客名(正式)"]),
        rollupField(p["受注チャネルロールアップ"]),
        textField(p["自動車登録番号（ナンバー）"]),
        textField(p["初度登録年月"]),
        textField(p["型式"]),
        textField(p["車両情報"]),
        textField(p["総指数(ディーラー案件用)"]),
        textField(p["先方管理No."]),
        textField(p["備考(整備士)"]),
        numberField(p["整備士報酬(税込)"]),
        numberField(p["交通費(税込)"]),
        numberField(p["立替代(税込)"]),
      ]
    })

    const csv =
      [header, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n")

    return new Response("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rewards-${year}-${month + 1}.csv"`,
      },
    })
  } catch (error) {
    console.error("CSV ERROR:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}


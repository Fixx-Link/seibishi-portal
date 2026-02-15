import { NextResponse } from "next/server"
import { getJobsByDate } from "@/lib/notion/jobs"

export async function GET(req: Request) {
  // 🔐 Cron認証チェック
  if (
    req.headers.get("authorization") !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateStr = tomorrow.toISOString().slice(0, 10)

    const jobs = await getJobsByDate(dateStr)

    for (const job of jobs) {
      const page = job as any
      const props = page.properties

      const mechanicLineId =
        props["LINE_ID"]?.rollup?.array[0]?.rich_text[0]?.plain_text

      if (!mechanicLineId) continue

      const customer =
        props?.["顧客名(正式)"]?.title?.[0]?.plain_text ?? ""

      const message = `【作業リマインド】
明日は下記案件です。

顧客：${customer}
日付：${dateStr}

忘れずにお願いいたします。`

      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: mechanicLineId,
          messages: [
            {
              type: "text",
              text: message,
            },
          ],
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("LINE REMINDER ERROR:", error)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

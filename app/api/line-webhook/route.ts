import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const events = body.events

    for (const event of events) {
      if (event.type === "message") {
        const userId = event.source.userId
        const text = event.message.text

        console.log("UserId:", userId)
        console.log("Message:", text)

        // ここでSupabaseに保存するのが理想
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

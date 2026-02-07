import { notion } from "./client"

export async function getMechanicByEmail(email: string) {
  const response = await notion.dataSources.query({
    data_source_id: process.env.NOTION_MECHANIC_DATABASE_ID!, // ← 整備士リストDBのID

    filter: {
      property: "メールアドレス",
      email: {
        equals: email,
      },
    },
    page_size: 1,
  })

  return response.results[0] ?? null
}

import { notion } from "./client"

export async function getMonthlyCompletedJobs(email: string, year: number, month: number) {
  // 月初
  const start = new Date(year, month - 1, 1)
  // 月末
  const end = new Date(year, month, 0)

  const response = await notion.dataSources.query({
    data_source_id: process.env.NOTION_DATABASE_ID!,

    filter: {
      and: [
        // 担当整備士が自分
        {
          property: "整備士メアド",
          rollup: {
            any: {
              rich_text: { equals: email },
            },
          },
        },

        // 作業日が指定月内
        {
          property: "作業日",
          date: {
            on_or_after: start.toISOString(),
            on_or_before: end.toISOString(),
          },
        },

        // 作業ステータスが完了系
        {
          or: [
            {
              property: "作業ステータス",
              status: { equals: "作業完了" },
            },
            {
              property: "作業ステータス",
              status: { equals: "完了" },
            },
          ],
        },
      ],
    },

    sorts: [
      {
        property: "作業日",
        direction: "ascending",
      },
    ],
  })

  return response.results
}

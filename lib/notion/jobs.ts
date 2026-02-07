import { notion } from "./client"

export async function getMyActiveJobs(email: string) {
  const response = await notion.dataSources.query({
    data_source_id: process.env.NOTION_DATABASE_ID!,

    filter: {
      and: [
        {
          property: "整備士メアド",
          rollup: {
            any: {
              rich_text: {
                equals: email,
              },
            },
          },
        },
        {
          or: [
            {
              property: "作業ステータス",
              status: { equals: "スタンバイ" },
            },
            {
              property: "作業ステータス",
              status: { equals: "不具合発生中" },
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

export async function getCompletedJobsByEmail(
  email: string,
  start?: string,
  end?: string
) {
  const filters: any[] = [
    {
      property: "整備士メアド",
      rollup: {
        any: {
          rich_text: {
            equals: email,
          },
        },
      },
    },
    {
      or: [
        { property: "作業ステータス", status: { equals: "作業完了" } },
        { property: "作業ステータス", status: { equals: "完了" } },
      ],
    },
  ]

  if (start && end) {
    filters.push({
      property: "作業日",
      date: {
        on_or_after: start,
        on_or_before: end,
      },
    })
  }

  const response = await notion.dataSources.query({
    data_source_id: process.env.NOTION_DATABASE_ID!,
    filter: { and: filters },
    sorts: [{ property: "作業日", direction: "ascending" }],
  })

  return response.results
}

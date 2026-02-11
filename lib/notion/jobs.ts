import { notion } from "./client"
import { QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints"

/**
 * 🔵 進行中案件取得
 */
export async function getMyActiveJobs(email: string) {
  if (!email) return []

  const params: QueryDataSourceParameters = {
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
  }

  try {
    const response = await notion.dataSources.query(params)
    return response.results
  } catch (error) {
    console.error("進行中案件取得エラー:", error)
    return []
  }
}

/**
 * 🟢 完了案件取得
 */
export async function getCompletedJobsByEmail(
  email: string,
  start?: string,
  end?: string
) {
  if (!email) return []

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

  const params: QueryDataSourceParameters = {
    data_source_id: process.env.NOTION_DATABASE_ID!,
    filter: { and: filters },
    sorts: [{ property: "作業日", direction: "ascending" }],
  }

  try {
    const response = await notion.dataSources.query(params)
    return response.results
  } catch (error) {
    console.error("完了案件取得エラー:", error)
    return []
  }
}

/**
 * 🟣 単一案件取得（詳細ページ用）
 */
export async function getJobById(id: string) {
  if (!id) return null

  try {
    // 🔥 ハイフンはそのままでOK
    const response = await notion.pages.retrieve({
      page_id: id,
    })

    return response
  } catch (error) {
    console.error("案件詳細取得エラー:", error)
    return null
  }
}

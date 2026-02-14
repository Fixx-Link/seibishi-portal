import { notion } from "./client"
import { QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints"
import { unstable_cache } from "next/cache"

/**
 * 🔵 進行中案件取得（高速化版）
 */
export const getMyActiveJobs = unstable_cache(
  async (email: string) => {
    if (!email) return []

    const params: QueryDataSourceParameters = {
      data_source_id: process.env.NOTION_DATABASE_ID!,
      page_size: 20,
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
  },
  ["active-jobs"],
  { revalidate: 60 }
)

/**
 * 🟢 完了案件取得（高速化版）
 */
export const getCompletedJobsByEmail = unstable_cache(
  async (email: string, start?: string, end?: string) => {
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

    if (start) {
      filters.push({
        property: "作業日",
        date: { on_or_after: start },
      })
    }

    if (end) {
      filters.push({
        property: "作業日",
        date: { on_or_before: end },
      })
    }

    const params: QueryDataSourceParameters = {
      data_source_id: process.env.NOTION_DATABASE_ID!,
      page_size: 20,
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
  },
  ["completed-jobs"],
  { revalidate: 60 }
)

/**
 * 🟣 単一案件取得（詳細ページ用・軽量キャッシュ）
 */
export const getJobById = unstable_cache(
  async (id: string) => {
    if (!id) return null

    try {
      const response = await notion.pages.retrieve({
        page_id: id,
      })
      return response
    } catch (error) {
      console.error("案件詳細取得エラー:", error)
      return null
    }
  },
  ["job-detail"],
  { revalidate: 60 }
)

/**
 * 🔴 指定日の案件取得（LINEリマインド用）
 */
export const getJobsByDate = unstable_cache(
  async (date: string) => {
    if (!date) return []

    const params: QueryDataSourceParameters = {
      data_source_id: process.env.NOTION_DATABASE_ID!,
      page_size: 50,
      filter: {
        property: "作業日",
        date: {
          equals: date,
        },
      },
    }

    try {
      const response = await notion.dataSources.query(params)
      return response.results
    } catch (error) {
      console.error("日付指定案件取得エラー:", error)
      return []
    }
  },
  ["jobs-by-date"],
  { revalidate: 300 }
)

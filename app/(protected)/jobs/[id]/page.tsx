import { notFound } from "next/navigation"
import { getJobById } from "@/lib/notion/jobs"

type PageProps = {
  params: Promise<{ id: string }>
}

function getRichText(prop: any) {
  return prop?.rich_text?.[0]?.plain_text ?? "-"
}

function getTitle(prop: any) {
  return prop?.title?.[0]?.plain_text ?? "-"
}

function getStatus(prop: any) {
  return prop?.status?.name ?? "-"
}

function getId(prop: any) {
  return prop?.unique_id?.number
    ? `${prop.unique_id.number}`
    : "-"
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job || !("properties" in job)) {
    return notFound()
  }

  const p = job.properties as any

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">案件詳細</h1>

      <Detail label="案件ID" value={getId(p["案件ID"])} />
      <Detail label="受注チャネル" value={getRichText(p["受注チャネル"])} />
      <Detail label="顧客担当者名" value={getRichText(p["顧客担当者名"])} />
      <Detail label="顧客TEL" value={getRichText(p["顧客TEL"])} />
      <Detail label="自動車登録番号" value={getRichText(p["自動車登録番号（ナンバー）"])} />
      <Detail label="初度登録年月" value={getRichText(p["初度登録年月"])} />
      <Detail label="型式" value={getRichText(p["型式"])} />
      <Detail label="車両情報" value={getRichText(p["車両情報"])} />
      <Detail label="総指数" value={getRichText(p["総指数(ディーラー案件用)"])} />
      <Detail label="先方管理No." value={getRichText(p["先方管理No."])} />
      <Detail label="備考(整備士)" value={getRichText(p["備考(整備士)"])} />
      <Detail label="作業ステータス" value={getStatus(p["作業ステータス"])} />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b pb-3">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  )
}

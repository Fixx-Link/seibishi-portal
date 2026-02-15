"use client"

export default function MonthSelector({
  months,
  selected,
}: {
  months: { label: string }[]
  selected: string
}) {
  return (
    <div className="mb-4">
      <select
        className="border rounded-lg px-3 py-2 text-sm"
        value={selected}
        onChange={(e) => {
          const month = encodeURIComponent(e.target.value)
          window.location.href = `/rewards?month=${month}`
        }}
      >
        {months.map((m) => (
          <option key={m.label} value={m.label}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  )
}

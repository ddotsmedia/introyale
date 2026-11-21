/** Shows only items whose value is verified (value !== null). Renders nothing when empty (D13). */
export function FactStrip({ items }: { items: { label: string; value: string | null }[] }) {
  const shown = items.filter(
    (i): i is { label: string; value: string } => i.value !== null && i.value !== '',
  )
  if (shown.length === 0) return null
  return (
    <dl className="border-travertine grid grid-cols-2 gap-4 border-y py-4 md:grid-cols-4">
      {shown.map((item) => (
        <div key={item.label}>
          <dt className="text-taupe text-sm">{item.label}</dt>
          <dd className="font-display text-ink text-2xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

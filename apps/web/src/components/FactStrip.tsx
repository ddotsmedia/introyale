/** Shows only items with a value. Renders nothing when empty (D13). */
export function FactStrip({
  items,
}: {
  items: { label: string; value: string | null | undefined }[]
}) {
  const shown = items.filter((i): i is { label: string; value: string } => !!i.value)
  if (shown.length === 0) return null
  return (
    <dl className="border-travertine mx-auto grid max-w-[1600px] grid-cols-2 gap-x-4 gap-y-4 border-y px-2 py-5 md:grid-cols-4 md:px-4">
      {shown.map((item) => (
        <div key={item.label} className="flex flex-col-reverse gap-1">
          <dt className="eyebrow">{item.label}</dt>
          <dd className="font-display text-3xl leading-tight tracking-tight">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

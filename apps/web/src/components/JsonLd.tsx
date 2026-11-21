/** Server-rendered JSON-LD. Null entries (unverified facts) are skipped; `<` is escaped. */
export function JsonLd({ data }: { data: (object | null)[] | object | null }) {
  const items = (Array.isArray(data) ? data : [data]).filter((i): i is object => i !== null)
  if (items.length === 0) return null
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\u003c') }}
        />
      ))}
    </>
  )
}

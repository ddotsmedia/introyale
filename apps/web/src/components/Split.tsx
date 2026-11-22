/**
 * Splits a heading into words, each inside an overflow mask, so CSS can slide them up one after another.
 * Rendered on the server: the final layout is identical to plain text, so there is no layout shift, and the text
 * stays real text for search engines and screen readers.
 */
export function Split({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${String(i)}`}>
          <span className="sw">
            <span style={{ '--i': offset + i } as React.CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}

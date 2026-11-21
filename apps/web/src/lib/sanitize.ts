/** Removes tags, control characters (keeping line breaks and tabs) and runaway whitespace. */
export function sanitizeText(input: string): string {
  const withoutTags = input.replace(/<[^>]*>/g, ' ')
  const printable = Array.from(withoutTags)
    .filter((ch) => {
      const code = ch.charCodeAt(0)
      return ch === '\n' || ch === '\t' || (code >= 32 && code !== 127)
    })
    .join('')
  return printable
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

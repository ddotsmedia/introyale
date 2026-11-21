import { cms } from './cms'

type LexNode = { type?: string; text?: string; tag?: string; children?: LexNode[]; root?: LexNode }

/** Plain text of a Lexical tree (for reading time and the table of contents). */
export function lexicalText(node: LexNode | undefined): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(lexicalText).join(' ')
}

/** Reading time at 220 words per minute, minimum one minute. */
export function readingMinutes(root: LexNode | undefined): number {
  const words = lexicalText(root).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

/** Table of contents: h2 and h3 headings, with a stable slug per heading. */
export function tableOfContents(
  root: LexNode | undefined,
): { id: string; text: string; level: 2 | 3 }[] {
  const out: { id: string; text: string; level: 2 | 3 }[] = []
  for (const child of root?.children ?? []) {
    if (child.type !== 'heading' || (child.tag !== 'h2' && child.tag !== 'h3')) continue
    const text = lexicalText(child).trim()
    if (!text) continue
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '')
    out.push({ id, text, level: child.tag === 'h3' ? 3 : 2 })
  }
  return out
}

/** The journal is hidden until at least three published articles exist (SPEC §3.1, C15). */
export async function publishedPostCount(): Promise<number> {
  const payload = await cms()
  const res = await payload.count({
    collection: 'journal-posts',
    where: { 'workflow.status': { equals: 'published' } },
    overrideAccess: false,
  })
  return res.totalDocs
}

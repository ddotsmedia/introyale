import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// NEXT-PROMPT part C: all page content lives in Payload. Components render CMS data; only short UI labels
// (in src/messages) may be written in code. This scans src/app and src/components for content that must
// come from the CMS: phone numbers, emails, introyale.com URLs, image paths and long sentences.

const ROOT = path.resolve(__dirname, '../../src')
const SCAN = ['app', 'components']
// API routes and the admin return data or machine messages, server actions hold validation messages,
// and the dev showcase 404s in production.
const SKIP = [
  `${path.sep}app${path.sep}api${path.sep}`,
  `${path.sep}app${path.sep}(payload)${path.sep}`,
  `${path.sep}components${path.sep}admin${path.sep}`,
  `${path.sep}dev${path.sep}`,
  `${path.sep}actions${path.sep}`,
]

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return files(p)
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : []
  })
}

/** Removes comments and import/export-from lines so only runtime strings remain. */
export function strip(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/^\s*(import|export)\s[^;\n]*from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
}

type Hit = { file: string; kind: string; text: string }

const TAILWIND_MARK = /[-:[\]/]/
function looksLikeClassList(s: string): boolean {
  const tokens = s.split(/\s+/).filter(Boolean)
  if (tokens.length < 2) return false
  // A class list has no capitals and no sentence punctuation; real copy has at least one of them.
  if (!/[A-Z.,;:!?]/.test(s) && tokens.every((t) => /^[a-z0-9:/[\]().%#_!*-]+$/.test(t)))
    return true
  return tokens.filter((t) => TAILWIND_MARK.test(t)).length / tokens.length >= 0.4
}

export function literals(src: string): string[] {
  const out: string[] = []
  // 'single', "double" and `template` literals (templates with ${} are checked on their static text).
  for (const m of src.matchAll(
    /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g,
  )) {
    const text = m[1] ?? m[2] ?? m[3] ?? ''
    out.push(...text.split(/\$\{[^}]*\}/))
  }
  // JSX text nodes, including ones that span several lines.
  for (const m of src.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) out.push(m[1] ?? '')
  return out.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

export function check(file: string, text: string): Hit[] {
  const hits: Hit[] = []
  // SVG path data and code fragments (comparisons, arrows, statements) are not content.
  if (/^[Mm]\s?-?\d/.test(text) || /(&&|\|\||[!=]==|=>)/.test(text) || /[;{}]/.test(text))
    return hits
  const add = (kind: string) =>
    hits.push({ file: path.relative(ROOT, file), kind, text: text.slice(0, 70) })
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(text)) add('email')
  if (/\+?\d[\d\s().-]{8,}\d/.test(text) && !/^\d+(\.\d+)?$/.test(text)) add('phone')
  if (/introyale\.com/i.test(text)) add('introyale.com url')
  if (
    /(^|\/)[\w-]+\.(jpe?g|png|webp|avif|svg|gif)\b/i.test(text) ||
    /\/(images|media)\//.test(text)
  )
    add('image path')
  const words = text.split(/\s+/).filter((w) => /^[A-Za-z][A-Za-z'’.,;:!?-]*$/.test(w))
  if (
    words.length >= 6 &&
    text.length >= 40 &&
    !looksLikeClassList(text) &&
    !/^[\w@/.-]+$/.test(text)
  )
    add('long sentence')
  return hits
}

describe('no hard-coded content in src/app and src/components (NEXT-PROMPT part C)', () => {
  const all = SCAN.flatMap((d) => files(path.join(ROOT, d))).filter(
    (f) => !SKIP.some((s) => f.includes(s)),
  )

  it('scans a meaningful number of files', () => {
    expect(all.length).toBeGreaterThan(40)
  })

  it('finds no phone, email, introyale.com URL, image path or long sentence', () => {
    const hits = all.flatMap((f) =>
      literals(strip(fs.readFileSync(f, 'utf8'))).flatMap((t) => check(f, t)),
    )
    const report = hits.map((h) => `${h.file} [${h.kind}] ${h.text}`).join('\n')
    expect(report).toBe('')
  })

  it('catches the patterns it claims to (self-check)', () => {
    const sample = [
      'Call +971 52 77 54 585 now',
      'hello@example.com',
      'https://www.introyale.com/about',
      '/images/hero.jpg',
      'This is a long sentence that belongs in the CMS and not in code',
    ]
    for (const s of sample) expect(check('x.tsx', s).length).toBeGreaterThan(0)
    expect(
      check('x.tsx', 'bg-ink text-ivory mt-8 inline-flex min-h-6 items-center px-3.5'),
    ).toEqual([])
    expect(check('x.tsx', 'zoom group relative block overflow-hidden bg-sand')).toEqual([])
  })

  it('reads multi-line JSX text', () => {
    const jsx = `<label>\n  I agree that the studio may reply to my message and keep it for as long as needed.\n</label>`
    const found = literals(jsx).flatMap((t) => check('x.tsx', t))
    expect(found.some((h) => h.kind === 'long sentence')).toBe(true)
  })
})

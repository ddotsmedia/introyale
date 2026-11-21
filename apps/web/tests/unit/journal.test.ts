import { describe, expect, it } from 'vitest'
import { lexicalText, readingMinutes, tableOfContents } from '../../src/lib/journal'

const doc = {
  root: {
    children: [
      { type: 'heading', tag: 'h2', children: [{ text: 'Materials & finishes' }] },
      { type: 'paragraph', children: [{ text: 'Words here.' }] },
      { type: 'heading', tag: 'h3', children: [{ text: 'Joinery' }] },
      { type: 'heading', tag: 'h1', children: [{ text: 'Ignored' }] },
    ],
  },
}

describe('journal helpers', () => {
  it('extracts plain text from Lexical nodes', () => {
    expect(lexicalText(doc.root)).toContain('Words here.')
  })

  it('builds a table of contents from h2 and h3 only', () => {
    expect(tableOfContents(doc.root)).toEqual([
      { id: 'materials-finishes', text: 'Materials & finishes', level: 2 },
      { id: 'joinery', text: 'Joinery', level: 3 },
    ])
  })

  it('reads at 220 words per minute with a one-minute minimum', () => {
    expect(readingMinutes({ children: [] })).toBe(1)
    const long = { children: [{ text: Array.from({ length: 660 }, () => 'word').join(' ') }] }
    expect(readingMinutes(long)).toBe(3)
  })
})

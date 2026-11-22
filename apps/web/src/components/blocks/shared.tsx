import type { HomePage } from '@/payload-types'
import { Split } from '../Split'

export type Layout = NonNullable<HomePage['layout']>
export type BlockOf<K extends Layout[number]['blockType']> = Extract<
  Layout[number],
  { blockType: K }
>

/** Splits CMS body text into paragraphs (blank line between paragraphs). */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** Eyebrow, heading and optional intro for a section. Renders nothing when all three are empty. */
export function SectionHeading({
  eyebrow,
  heading,
  intro,
  className = '',
  as: Tag = 'h2',
}: {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  className?: string
  as?: 'h1' | 'h2'
}) {
  if (!eyebrow && !heading && !intro) return null
  return (
    <header className={className}>
      {eyebrow && <p className="eyebrow eyebrow-draw">{eyebrow}</p>}
      {heading && (
        <Tag className="display split-view mt-2 text-[clamp(2.25rem,4.6vw,4rem)] text-balance">
          <Split text={heading} />
        </Tag>
      )}
      {intro && <p className="mt-3 max-w-2xl text-pretty opacity-80">{intro}</p>}
    </header>
  )
}

export const sectionPad = 'px-2 py-9 md:px-4 md:py-14'
export const container = 'mx-auto max-w-[1600px]'

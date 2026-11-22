import { Button } from '../Button'
import { container, type BlockOf } from './shared'

/**
 * Large serif statement. Each word fills with colour as the section scrolls through the viewport (CSS scroll-driven
 * animation). Without the effect, or with reduced motion, the whole statement shows in full colour.
 */
export function Statement({ block }: { block: BlockOf<'statement'> }) {
  const words = block.statement.split(/\s+/).filter(Boolean)
  const n = words.length
  return (
    <section className="stmt bg-ivory px-2 py-14 md:px-4 md:py-24">
      <div className={`${container} max-w-[68rem]`}>
        {block.eyebrow && <p className="eyebrow eyebrow-draw">{block.eyebrow}</p>}
        <p className="display stmt-text mt-3 text-[clamp(2rem,4.6vw,4.25rem)] leading-[1.12] text-balance">
          {words.map((w, i) => {
            const s = (i / n) * 0.78
            return (
              <span key={`${w}-${String(i)}`}>
                <span
                  className="stmt-word"
                  style={
                    { '--s': s.toFixed(3), '--e': (s + 0.22).toFixed(3) } as React.CSSProperties
                  }
                >
                  {w}
                </span>
                {i < n - 1 ? ' ' : null}
              </span>
            )
          })}
        </p>
        <Button cta={block.cta} tone="dark" className="mt-7" />
      </div>
    </section>
  )
}

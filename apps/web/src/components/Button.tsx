import Link from 'next/link'

const base =
  'inline-flex min-h-6 items-center justify-center px-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300'
const tones = {
  primary: 'bg-bronze-deep hover:bg-ink text-white',
  outline: 'border border-current hover:bg-white/10',
  dark: 'bg-ink hover:bg-night text-ivory',
} as const

export type ButtonTone = keyof typeof tones

/** Call-to-action link. Label and href are CMS values; nothing renders when either is empty. */
export function Button({
  cta,
  tone = 'primary',
  className = '',
}: {
  cta?: { label?: string | null; href?: string | null } | null
  tone?: ButtonTone
  className?: string
}) {
  if (!cta?.label || !cta.href) return null
  const external = /^https?:\/\//.test(cta.href)
  const classes = `${base} ${tones[tone]} ${className}`
  return external ? (
    <a href={cta.href} className={classes} rel="noopener noreferrer">
      {cta.label}
    </a>
  ) : (
    <Link href={cta.href} className={classes}>
      {cta.label}
    </Link>
  )
}

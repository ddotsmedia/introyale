import Link from 'next/link'
import { ui } from '@/messages/en'

/** Mobile-only action bar: Call, WhatsApp and the main call to action. Hrefs and label come from the CMS; empty ones are hidden. */
export function StickyActionBar({
  callHref,
  whatsappHref,
  cta,
}: {
  callHref?: string | null
  whatsappHref?: string | null
  cta?: { label: string; href: string } | null
}) {
  const items = [
    callHref ? { label: ui.call, href: callHref } : null,
    whatsappHref ? { label: ui.whatsapp, href: whatsappHref } : null,
    cta ?? null,
  ].filter((i): i is { label: string; href: string } => i !== null)
  if (items.length === 0) return null
  return (
    <nav
      aria-label={ui.quickActions}
      className="bg-night text-ivory fixed inset-x-0 bottom-0 z-30 border-t border-white/10 md:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${String(items.length)}, minmax(0, 1fr))` }}
      >
        {items.map((item, i) => (
          <li key={item.href + String(i)}>
            <Link
              href={item.href}
              className={`flex min-h-6 items-center justify-center px-1 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                i === items.length - 1 ? 'bg-bronze-deep text-white' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

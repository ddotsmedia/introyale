import Link from 'next/link'

/** Mobile-only action bar: Call · WhatsApp · Start (M4). Hrefs come from CMS contact-info; empty ones are hidden. */
export function StickyActionBar({
  callHref,
  whatsappHref,
  startHref,
}: {
  callHref?: string | null
  whatsappHref?: string | null
  startHref: string
}) {
  const items = [
    callHref ? { label: 'Call', href: callHref } : null,
    whatsappHref ? { label: 'WhatsApp', href: whatsappHref } : null,
    { label: 'Start', href: startHref },
  ].filter((i): i is { label: string; href: string } => i !== null)

  return (
    <nav
      aria-label="Quick actions"
      className="bg-ivory border-travertine fixed inset-x-0 bottom-0 z-30 border-t md:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${String(items.length)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-ink flex min-h-12 items-center justify-center px-2 py-3 text-sm font-semibold"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

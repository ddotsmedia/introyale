import Link from 'next/link'
import { ui } from '@/messages/en'
import { Picture, type MediaInput } from './Picture'

export type FooterColumn = { title: string; links: { label: string; href: string }[] }

/** Rich footer. Every line renders only when its CMS value or verified fact exists (D13). */
export function Footer({
  brand,
  logo,
  tagline,
  copy,
  columns,
  legal,
  address,
  phone,
  whatsappHref,
  email,
  social,
  credit,
}: {
  brand: string
  logo?: MediaInput
  tagline?: string | null
  copy?: string | null
  columns: FooterColumn[]
  legal: { label: string; href: string }[]
  address: string | null
  phone: string | null
  whatsappHref: string | null
  email: string | null
  social: { platform: string; url: string }[]
  credit?: { text: string | null; name: string; url: string | null } | null
}) {
  return (
    <footer className="bg-night text-ivory on-dark">
      <div className="mx-auto max-w-[1600px] px-2 py-8 md:px-4 md:py-12">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            {logo ? (
              <Picture media={logo} sizes="220px" className="h-8 w-auto" />
            ) : (
              <p className="font-display text-3xl">{brand}</p>
            )}
            {tagline && (
              <p className="font-display mt-3 max-w-xs text-2xl leading-snug">{tagline}</p>
            )}
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="md:col-span-2">
              <h2 className="eyebrow">{col.title}</h2>
              <ul className="mt-2.5 space-y-1.5 text-base">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-ivory/80 hover:text-ivory transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <address className="md:col-span-4 not-italic">
            <h2 className="eyebrow">{ui.address}</h2>
            <div className="text-ivory/80 mt-2.5 space-y-1.5 text-base">
              {address && <p>{address}</p>}
              {phone && (
                <p>
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-ivory">
                    {phone}
                  </a>
                </p>
              )}
              {whatsappHref && (
                <p>
                  <a href={whatsappHref} className="hover:text-ivory">
                    {ui.whatsapp}
                  </a>
                </p>
              )}
              {email && (
                <p>
                  <a href={`mailto:${email}`} className="hover:text-ivory">
                    {email}
                  </a>
                </p>
              )}
            </div>
            {social.length > 0 && (
              <ul
                aria-label={ui.social}
                className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1 text-base"
              >
                {social.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ivory/80 hover:text-ivory"
                    >
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </address>
        </div>

        <div className="border-ivory/15 text-ivory/60 mt-8 flex flex-col gap-2 border-t pt-3 text-sm md:flex-row md:items-center md:justify-between">
          {copy && <p>{copy}</p>}
          {legal.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-ivory">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {credit && (
          <p className="text-ivory/60 mt-2 text-center text-sm md:text-end">
            {credit.text ? `${credit.text} ` : null}
            {credit.url ? (
              <a
                href={credit.url}
                target="_blank"
                rel="noopener"
                className="hover:text-ivory underline-offset-2 hover:underline"
              >
                {credit.name}
              </a>
            ) : (
              credit.name
            )}
          </p>
        )}
      </div>
    </footer>
  )
}

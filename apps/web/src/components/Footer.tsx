import Link from 'next/link'

/** Footer with the NAP block. Each contact line renders only when its fact is verified (D13). */
export function Footer({
  brand,
  copy,
  links,
  address,
  phone,
  email,
}: {
  brand: string
  copy: string | null
  links: { label: string; href: string }[]
  address: string | null
  phone: string | null
  email: string | null
}) {
  return (
    <footer className="border-travertine bg-sand border-t">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-ink text-lg">{brand}</p>
          {copy && <p className="text-taupe mt-2 text-sm">{copy}</p>}
        </div>
        {(address || phone || email) && (
          <address className="text-ink not-italic text-sm">
            {address && <p>{address}</p>}
            {phone && (
              <p>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="underline">
                  {phone}
                </a>
              </p>
            )}
            {email && (
              <p>
                <a href={`mailto:${email}`} className="underline">
                  {email}
                </a>
              </p>
            )}
          </address>
        )}
        {links.length > 0 && (
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-2 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  )
}

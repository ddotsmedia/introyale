import Link from 'next/link'
import { Breadcrumbs } from '@/components/Structure'
import { listPublished } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function ServicesIndex() {
  const services = await listPublished('services')
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">Services</h1>
      {services.length === 0 ? (
        <p className="text-taupe mt-6">No services are published yet.</p>
      ) : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <li key={s.id}>
              <Link
                href={`/services/${s.slug}`}
                className="font-display text-ink text-2xl underline"
              >
                {s.title}
              </Link>
              {s.summary && <p className="text-ink/90 mt-2">{s.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

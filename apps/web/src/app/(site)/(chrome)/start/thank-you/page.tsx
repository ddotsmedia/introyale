import Link from 'next/link'
import { ProjectCard } from '@/components/ProjectCard'
import { listPublished } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function ThankYou({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const ref = typeof sp.ref === 'string' && /^IR-\d{4}-\d{4}$/.test(sp.ref) ? sp.ref : null
  const projects = await listPublished('projects', 3)
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <h1 className="font-display text-ink text-4xl">Thank you</h1>
      <p className="text-ink/90 mt-4 max-w-prose">
        {ref ? (
          <>
            We have received your request. Your reference is <strong>{ref}</strong>. A confirmation
            is on its way to your inbox.
          </>
        ) : (
          'We have received your request.'
        )}
      </p>
      <h2 className="font-display text-ink mt-10 text-2xl">What happens next</h2>
      <ol className="mt-4 list-decimal space-y-2 ps-6">
        <li>A member of the studio reads your brief.</li>
        <li>We reply using the method you chose.</li>
        <li>We arrange a short conversation about your space.</li>
      </ol>
      {projects.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-ink text-2xl">Recent work</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                href={`/work/${p.slug}`}
                title={p.publicTitle ?? p.title}
                areaLabel={p.areaLabel}
                year={p.year}
                hero={p.hero}
              />
            ))}
          </div>
        </div>
      )}
      <Link href="/" className="mt-12 inline-block underline">
        Back to home
      </Link>
    </section>
  )
}

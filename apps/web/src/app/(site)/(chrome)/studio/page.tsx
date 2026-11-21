import Link from 'next/link'
import { Breadcrumbs, Prose } from '@/components/Structure'
import { TeamCard } from '@/components/Structure'
import { getPageBySlug, listClients, listPublished } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function StudioPage() {
  const [page, team, clients] = await Promise.all([
    getPageBySlug('pages', 'studio'),
    listPublished('team-members', 4),
    listClients(),
  ])
  return (
    <article className="mx-auto max-w-[1440px] space-y-12 px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Studio' }]} />
      <header>
        <h1 className="font-display text-ink text-4xl">{page?.title ?? 'Studio'}</h1>
        {page?.intro && (
          <Prose>
            <p>{page.intro}</p>
          </Prose>
        )}
      </header>
      {team.length > 0 && (
        <section aria-labelledby="team-preview">
          <div className="flex items-end justify-between">
            <h2 id="team-preview" className="font-display text-ink text-2xl">
              Team
            </h2>
            <Link href="/studio/team" className="underline">
              All team members
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {team.map((m) => (
              <Link key={m.id} href={`/studio/team/${m.slug}`}>
                <TeamCard name={m.name} role={m.role} photo={m.photo} consentGiven />
              </Link>
            ))}
          </div>
        </section>
      )}
      {clients.length > 0 && (
        <section aria-labelledby="clients">
          <h2 id="clients" className="font-display text-ink text-2xl">
            Clients
          </h2>
          <ul className="mt-4 flex flex-wrap gap-6">
            {clients.map((c) => (
              <li key={c.id} className="text-ink">
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

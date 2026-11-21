import Link from 'next/link'
import { Breadcrumbs, TeamCard } from '@/components/Structure'
import { listPublished } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function TeamIndex() {
  const team = await listPublished('team-members', 100)
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Studio', href: '/studio' },
          { label: 'Team' },
        ]}
      />
      <h1 className="font-display text-ink mt-6 text-4xl">Team</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {team.map((m) => (
          <Link key={m.id} href={`/studio/team/${m.slug}`}>
            <TeamCard name={m.name} role={m.role} photo={m.photo} consentGiven />
          </Link>
        ))}
      </div>
    </section>
  )
}

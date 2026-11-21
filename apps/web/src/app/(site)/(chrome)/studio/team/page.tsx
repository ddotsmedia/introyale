import Link from 'next/link'
import { ui } from '@/messages/en'
import { Breadcrumbs, TeamCard } from '@/components/Structure'
import { listPublished } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function TeamIndex() {
  const team = await listPublished('team-members', 100)
  return (
    <section className="mx-auto max-w-[1440px] px-2 py-5 md:px-3">
      <Breadcrumbs
        items={[
          { label: ui.home, href: '/' },
          { label: ui.studio, href: '/studio' },
          { label: ui.team },
        ]}
      />
      <h1 className="font-display text-ink mt-3 text-4xl">{ui.team}</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {team.map((m) => (
          <Link key={m.id} href={`/studio/team/${m.slug}`}>
            <TeamCard name={m.name} role={m.role} photo={m.photo} consentGiven />
          </Link>
        ))}
      </div>
    </section>
  )
}

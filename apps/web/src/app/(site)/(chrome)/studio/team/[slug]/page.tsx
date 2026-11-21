import { notFound } from 'next/navigation'
import { Breadcrumbs, Prose, TeamCard } from '@/components/Structure'
import { getPageBySlug } from '@/lib/cms'

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { pageMetadata, SITE_URL } from '@/lib/seo'
import * as schema from '@/lib/schema'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const member = await getPageBySlug('team-members', slug)
  if (!member || member.consent?.given !== true) return {}
  return pageMetadata({
    seo: member.seo,
    fallbackTitle: member.name,
    fallbackDescription: member.role,
    path: `/studio/team/${slug}`,
  })
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const member = await getPageBySlug('team-members', slug)
  // Profiles render only with consent and a bio (SPEC §4).
  if (!member || member.consent?.given !== true || !member.bio) notFound()
  const ld = schema.person({
    name: member.name,
    jobTitle: member.role,
    url: `${SITE_URL}/studio/team/${member.slug}`,
    consentGiven: true,
  })
  return (
    <article className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <JsonLd data={ld} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Studio', href: '/studio' },
          { label: 'Team', href: '/studio/team' },
          { label: member.name },
        ]}
      />
      <div className="mt-6">
        <TeamCard name={member.name} role={member.role} photo={member.photo} consentGiven />
      </div>
      <Prose>
        <p>{member.bio}</p>
      </Prose>
      {(member.credentials ?? []).length > 0 && (
        <ul className="text-ink mt-6 list-disc ps-6">
          {(member.credentials ?? []).map((c, i) => (
            <li key={i}>{c.item}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

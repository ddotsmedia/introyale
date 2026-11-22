import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CmsPage } from '@/components/CmsPage'
import { cms } from '@/lib/cms'
import { previewScope } from '@/lib/previewScope'
import { verifyPreview } from '@/lib/previewToken'
import { readSecret } from '@/lib/secrets'
import CaseStudy from '../../work/[slug]/page'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Draft preview',
}

/** Draft preview behind an expiring signed link. Never indexed; an invalid or expired token is a plain 404. */
export default async function Preview({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const claim = verifyPreview(token, readSecret('PAYLOAD_SECRET'))
  if (!claim) notFound()
  const payload = await cms()
  const doc = (await payload
    .findByID({ collection: claim.c, id: claim.id, depth: 0, overrideAccess: true })
    .catch(() => null)) as { slug?: string } | null
  if (!doc?.slug) notFound()
  const slug = doc.slug
  // Run the real page component inside the scope so it renders exactly as it will once published.
  return previewScope.run(claim, () =>
    claim.c === 'projects' ? CaseStudy({ params: Promise.resolve({ slug }) }) : CmsPage({ slug }),
  )
}

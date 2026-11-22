import Link from 'next/link'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { container, sectionPad } from '@/components/blocks/shared'
import { PageHeader } from '@/components/PageHeader'
import { getPageBySlug } from '@/lib/cms'
import { ui } from '@/messages/en'

export const dynamic = 'force-dynamic'

export default async function ThankYou({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const ref = typeof sp.ref === 'string' && /^IR-\d{4}-\d{4}$/.test(sp.ref) ? sp.ref : null
  const page = await getPageBySlug('pages', 'thank-you')
  const hasBlocks = (page?.layout ?? []).length > 0
  return (
    <>
      {hasBlocks ? (
        <BlockRenderer layout={page?.layout} />
      ) : (
        <PageHeader title={page?.title ?? ui.thanks.title} intro={ui.thanks.body} />
      )}
      <section className={`${sectionPad} bg-ivory`}>
        <div className={container}>
          <svg className="check-draw mb-3" viewBox="0 0 52 52" aria-hidden="true" focusable="false">
            <circle cx="26" cy="26" r="23" pathLength="1" />
            <path d="M15 27l8 8 15-17" pathLength="1" />
          </svg>
          {ref && (
            <p className="font-display text-3xl tracking-tight">
              <span className="eyebrow me-2">{ui.thanks.reference}</span>
              {ref}
            </p>
          )}
          <Link href="/" className="eyebrow mt-5 inline-block border-b border-current pb-0.5">
            {ui.thanks.link}
          </Link>
        </div>
      </section>
    </>
  )
}

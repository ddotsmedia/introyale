import { notFound } from 'next/navigation'
import { Breadcrumbs, Prose } from '@/components/Structure'
import { getPageBySlug } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function ProcessPage() {
  const page = await getPageBySlug('pages', 'process')
  if (!page) notFound()
  return (
    <article className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Process' }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">{page.title}</h1>
      <Prose>
        {(page.body ?? '')
          .split(/\n{2,}/)
          .filter((p) => p.trim() !== '')
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </Prose>
    </article>
  )
}

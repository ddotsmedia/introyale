import { notFound } from 'next/navigation'
import { Breadcrumbs, Prose } from './Structure'
import { getPageBySlug } from '@/lib/cms'

/** Legal pages are CMS documents. No published document → 404, never placeholder text. */
export async function LegalPage({ slug, label }: { slug: string; label: string }) {
  const doc = await getPageBySlug('pages', slug)
  if (!doc) notFound()
  return (
    <article className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">{doc.title}</h1>
      <Prose>
        {(doc.body ?? '')
          .split(/\n{2,}/)
          .filter((p) => p.trim() !== '')
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </Prose>
    </article>
  )
}

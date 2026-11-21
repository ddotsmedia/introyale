import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Structure'
import { cms } from '@/lib/cms'
import { publishedPostCount } from '@/lib/journal'

export const dynamic = 'force-dynamic'

export default async function JournalIndex() {
  if ((await publishedPostCount()) < 3) notFound()
  const payload = await cms()
  const [posts, categories] = await Promise.all([
    payload.find({
      collection: 'journal-posts',
      where: { 'workflow.status': { equals: 'published' } },
      sort: '-reviewedAt',
      limit: 24,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({ collection: 'journal-categories', limit: 50, depth: 0, overrideAccess: true }),
  ])
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Journal' }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">Journal</h1>
      {categories.docs.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-4 text-sm">
          {categories.docs.map((c) => (
            <li key={c.id}>
              <Link href={`/journal/category/${c.slug}`} className="underline">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-10 grid gap-8 md:grid-cols-2">
        {posts.docs.map((p) => (
          <li key={p.id}>
            <Link href={`/journal/${p.slug}`} className="font-display text-ink text-2xl underline">
              {p.title}
            </Link>
            {p.excerpt && <p className="text-ink/90 mt-2">{p.excerpt}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

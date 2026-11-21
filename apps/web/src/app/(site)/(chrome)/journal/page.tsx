import Link from 'next/link'
import { ui } from '@/messages/en'
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
    <section className="mx-auto max-w-[1440px] px-2 py-5 md:px-3">
      <Breadcrumbs items={[{ label: ui.home, href: '/' }, { label: ui.journal.title }]} />
      <h1 className="font-display text-ink mt-3 text-4xl">{ui.journal.title}</h1>
      {categories.docs.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
          {categories.docs.map((c) => (
            <li key={c.id}>
              <Link href={`/journal/category/${c.slug}`} className="underline">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {posts.docs.map((p) => (
          <li key={p.id}>
            <Link href={`/journal/${p.slug}`} className="font-display text-ink text-2xl underline">
              {p.title}
            </Link>
            {p.excerpt && <p className="text-ink/90 mt-1">{p.excerpt}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

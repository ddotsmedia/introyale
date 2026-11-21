import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Structure'
import { cms } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function JournalCategory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await cms()
  const cat = await payload.find({
    collection: 'journal-categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const category = cat.docs[0]
  if (!category) notFound()
  const posts = await payload.find({
    collection: 'journal-posts',
    where: {
      and: [
        { 'workflow.status': { equals: 'published' } },
        { categories: { contains: category.id } },
      ],
    },
    limit: 50,
    depth: 0,
    overrideAccess: false,
  })
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Journal', href: '/journal' },
          { label: category.title },
        ]}
      />
      <h1 className="font-display text-ink mt-6 text-4xl">{category.title}</h1>
      <ul className="mt-8 space-y-4">
        {posts.docs.map((p) => (
          <li key={p.id}>
            <Link href={`/journal/${p.slug}`} className="font-display text-ink text-xl underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

import type { Metadata } from 'next'
import { ui } from '@/messages/en'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Breadcrumbs } from '@/components/Structure'
import { getPageBySlug } from '@/lib/cms'
import { readingMinutes, tableOfContents } from '@/lib/journal'

export const dynamic = 'force-dynamic'

type Root = Parameters<typeof tableOfContents>[0]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPageBySlug('journal-posts', slug)
  if (!post) return {}
  return {
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt ?? undefined,
  }
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPageBySlug('journal-posts', slug)
  if (!post) notFound()
  const root = post.body?.root as Root
  const toc = tableOfContents(root)
  const author = typeof post.author === 'object' ? post.author : null
  const related = (post.relatedProjects ?? []).filter((p) => typeof p === 'object')

  // Article structured data from fields that exist on the document only.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    dateModified: post.reviewedAt ?? undefined,
    author: author ? { '@type': 'Person', name: author.name } : undefined,
  }

  return (
    <article className="mx-auto max-w-[1440px] px-2 py-5 md:px-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: ui.home, href: '/' },
          { label: ui.journal.title, href: '/journal' },
          { label: post.title },
        ]}
      />
      <h1 className="font-display text-ink mt-3 text-4xl">{post.title}</h1>
      <p className="text-taupe mt-1 text-sm">
        {author ? `${author.name} · ` : ''}
        {String(readingMinutes(root))} {ui.journal.minRead}
      </p>
      {toc.length > 0 && (
        <nav
          aria-label={ui.journal.contents}
          className="border-travertine mt-3 border-s-2 ps-2 text-sm"
        >
          <ul className="space-y-0.5">
            {toc.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'ms-2' : ''}>
                <a href={`#${h.id}`} className="underline">
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="mt-4 max-w-prose">
        <RichText data={post.body as unknown as Parameters<typeof RichText>[0]['data']} />
      </div>
      {related.length > 0 && (
        <aside aria-labelledby="related" className="mt-6">
          <h2 id="related" className="font-display text-ink text-2xl">
            {ui.journal.related}
          </h2>
          <ul className="mt-2 space-y-1">
            {related.map((p) => (
              <li key={p.id}>
                <Link href={`/work/${p.slug}`} className="underline">
                  {p.publicTitle ?? p.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  )
}

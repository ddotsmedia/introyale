import type { DataFromGlobalSlug, GlobalSlug } from 'payload'
import { cms, verifiedFact } from './cms'

/** Published pages that may appear as legal links in the footer. The live site has none until the owner supplies text. */
const LEGAL_SLUGS = ['privacy', 'terms', 'cookies', 'accessibility'] as const

export function whatsappHref(value: string | null): string | null {
  const digits = value?.replace(/[^\d]/g, '') ?? ''
  return digits ? `https://wa.me/${digits}` : null
}

export async function globalBySlug<T extends GlobalSlug>(
  slug: T,
  depth = 2,
): Promise<DataFromGlobalSlug<T>> {
  const payload = await cms()
  return payload.findGlobal({ slug, depth, overrideAccess: false })
}

/** Everything the header, footer and mobile bar need, read from globals and verified facts. */
export async function siteChrome() {
  const payload = await cms()
  const [settings, nav, footer, social, address, phone, whatsapp, email, legalPages] =
    await Promise.all([
      globalBySlug('site-settings'),
      globalBySlug('navigation'),
      globalBySlug('footer'),
      globalBySlug('social-profiles', 0),
      verifiedFact('address'),
      verifiedFact('phone'),
      verifiedFact('whatsapp'),
      verifiedFact('email'),
      payload.find({
        collection: 'pages',
        where: {
          and: [{ slug: { in: [...LEGAL_SLUGS] } }, { 'workflow.status': { equals: 'published' } }],
        },
        limit: 10,
        depth: 0,
        overrideAccess: false,
      }),
    ])
  const publishedPosts = await payload.count({
    collection: 'journal-posts',
    where: { 'workflow.status': { equals: 'published' } },
    overrideAccess: false,
  })
  // The journal stays out of navigation until three articles are published (SPEC C15).
  const items = (nav.items ?? [])
    .filter((i) => i.label && i.link)
    .filter((i) => publishedPosts.totalDocs >= 3 || !i.link.startsWith('/journal'))
    .map((i) => ({ label: i.label, href: i.link }))
  const settingsName = settings.name
  return {
    brand: typeof settingsName === 'string' && settingsName.trim() !== '' ? settingsName : '',
    logo: settings.logo,
    footerLogo: settings.footerLogo ?? settings.logo,
    tagline: settings.tagline ?? null,
    banner:
      settings.banner?.enabled && settings.banner.message
        ? { message: settings.banner.message, tone: settings.banner.tone ?? 'info' }
        : null,
    cta:
      settings.ctaLabel && settings.ctaLink
        ? { label: settings.ctaLabel, href: settings.ctaLink }
        : null,
    nav: items,
    footerCopy: footer.copy ?? null,
    footerColumns: (footer.columns ?? []).map((c) => ({
      title: c.title ?? '',
      links: (c.links ?? []).flatMap((l) =>
        l.label && l.link ? [{ label: l.label, href: l.link }] : [],
      ),
    })),
    legal: legalPages.docs.map((p) => ({ label: p.title, href: `/${p.slug}` })),
    social: (social.items ?? []).map((s) => ({ platform: s.platform, url: s.url })),
    address,
    phone,
    email,
    whatsappHref: whatsappHref(whatsapp),
  }
}

export type SiteChrome = Awaited<ReturnType<typeof siteChrome>>

/** Defaults for titles and descriptions, from the SEO defaults global. */
export type SeoDefaults = {
  titleTemplate: string | null
  description: string | null
  siteName: string
  iconUrl: string | null
}

const NO_DEFAULTS: SeoDefaults = {
  titleTemplate: null,
  description: null,
  siteName: '',
  iconUrl: null,
}

/** Titles and descriptions fall back to empty when the CMS is unreachable (e.g. the database-free a11y job). */
export async function seoDefaults(): Promise<SeoDefaults> {
  try {
    return await readSeoDefaults()
  } catch {
    return NO_DEFAULTS
  }
}

async function readSeoDefaults(): Promise<SeoDefaults> {
  const [seo, settings] = await Promise.all([
    globalBySlug('seo-defaults', 0),
    globalBySlug('site-settings', 1),
  ])
  const logo = typeof settings.logo === 'object' ? settings.logo : null
  return {
    titleTemplate: seo.titleTemplate ?? null,
    description: seo.description ?? null,
    siteName: typeof settings.name === 'string' ? settings.name : '',
    // Favicon is the logo from Site settings (a CMS image, never a path in code).
    iconUrl: logo?.sizes?.w480?.url ?? logo?.url ?? null,
  }
}

/** The closing call-to-action band (end of case studies), edited in Site settings. Null when not filled in. */
export async function closingCta() {
  const settings = await globalBySlug('site-settings', 1)
  const c = settings.closingCta
  if (!c?.heading) return null
  return {
    blockType: 'ctaBand' as const,
    heading: c.heading,
    text: c.text ?? null,
    image: c.image,
    button: { label: c.buttonLabel ?? null, href: c.buttonHref ?? null },
  }
}

/** Published projects, balanced across sectors (round-robin) so a short list shows variety. */
export async function balancedProjects(limit: number) {
  const payload = await cms()
  const res = await payload.find({
    collection: 'projects',
    where: { 'workflow.status': { equals: 'published' } },
    sort: 'createdAt',
    limit: 60,
    depth: 2,
    overrideAccess: false,
  })
  const bySector = new Map<string, typeof res.docs>()
  for (const p of res.docs) {
    const key = typeof p.sector === 'object' && p.sector ? String(p.sector.id) : 'none'
    bySector.set(key, [...(bySector.get(key) ?? []), p])
  }
  const picked: typeof res.docs = []
  const lists = [...bySector.values()]
  for (let round = 0; picked.length < limit && lists.some((l) => l[round]); round++) {
    for (const l of lists) {
      const p = l[round]
      if (p && picked.length < limit) picked.push(p)
    }
  }
  return picked
}

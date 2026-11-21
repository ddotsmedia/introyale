// JSON-LD builders (SPEC §7 M9). Each returns plain objects; missing optional fields are omitted.
// Facts-based values are passed in already verified (D13). Nothing here invents business data.

export type Json = Record<string, unknown>

const ctx = 'https://schema.org'

function clean(obj: Json): Json {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

export function organization(p: {
  name: string
  url: string
  logo?: string | null
  email?: string | null
  telephone?: string | null
}): Json {
  return clean({
    '@context': ctx,
    '@type': 'Organization',
    name: p.name,
    url: p.url,
    logo: p.logo,
    email: p.email,
    telephone: p.telephone,
  })
}

export function website(p: { name: string; url: string }): Json {
  return clean({ '@context': ctx, '@type': 'WebSite', name: p.name, url: p.url })
}

/** LocalBusiness only with verified address and telephone (SPEC §5.2). Returns null otherwise. */
export function localBusiness(p: {
  name: string
  url: string
  telephone: string | null
  address: string | null
  licenceNumber?: string | null
}): Json | null {
  if (!p.telephone || !p.address) return null
  return clean({
    '@context': ctx,
    '@type': 'LocalBusiness',
    name: p.name,
    url: p.url,
    telephone: p.telephone,
    address: { '@type': 'PostalAddress', streetAddress: p.address, addressCountry: 'AE' },
    identifier: p.licenceNumber ?? undefined,
  })
}

export function breadcrumb(items: { name: string; url: string }[]): Json {
  return {
    '@context': ctx,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.name,
      item: i.url,
    })),
  }
}

export function service(p: {
  name: string
  description?: string | null
  url: string
  providerName: string
}): Json {
  return clean({
    '@context': ctx,
    '@type': 'Service',
    name: p.name,
    description: p.description,
    url: p.url,
    provider: { '@type': 'Organization', name: p.providerName },
  })
}

/** FAQPage from eligible questions only (SPEC §5.2 `eligibleForSchema`). */
export function faqPage(
  faqs: { question: string; answer: string; eligible: boolean }[],
): Json | null {
  const eligible = faqs.filter((f) => f.eligible && f.question && f.answer)
  if (eligible.length === 0) return null
  return {
    '@context': ctx,
    '@type': 'FAQPage',
    mainEntity: eligible.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/** Person only when consent is recorded (SPEC §5.2). */
export function person(p: {
  name: string
  jobTitle: string
  url: string
  consentGiven: boolean
}): Json | null {
  if (!p.consentGiven) return null
  return { '@context': ctx, '@type': 'Person', name: p.name, jobTitle: p.jobTitle, url: p.url }
}

export function article(p: {
  headline: string
  description?: string | null
  authorName?: string | null
  dateModified?: string | null
  image?: string | null
}): Json {
  return clean({
    '@context': ctx,
    '@type': 'Article',
    headline: p.headline,
    description: p.description,
    dateModified: p.dateModified,
    author: p.authorName ? { '@type': 'Person', name: p.authorName } : undefined,
    image: p.image,
  })
}

export function imageObject(p: {
  contentUrl: string
  name: string
  caption?: string | null
}): Json {
  return clean({
    '@context': ctx,
    '@type': 'ImageObject',
    contentUrl: p.contentUrl,
    name: p.name,
    caption: p.caption,
  })
}

/** Required properties per type. Used by the CI-style validation test (not a Google validator). */
const REQUIRED: Record<string, string[]> = {
  Organization: ['name', 'url'],
  WebSite: ['name', 'url'],
  LocalBusiness: ['name', 'url', 'telephone', 'address'],
  BreadcrumbList: ['itemListElement'],
  Service: ['name', 'provider'],
  FAQPage: ['mainEntity'],
  Person: ['name', 'url'],
  Article: ['headline'],
  ImageObject: ['contentUrl', 'name'],
}

/** Returns the list of problems (empty when the object carries every required property). */
export function schemaProblems(obj: Json): string[] {
  const rawType = obj['@type']
  const type = typeof rawType === 'string' ? rawType : ''
  const required = REQUIRED[type]
  if (!required) return [`unknown type ${type || '(none)'}`]
  return required
    .filter((k) => obj[k] === undefined || obj[k] === null)
    .map((k) => `${type} is missing ${k}`)
}

// JSON-LD builders (SPEC §7 M9, M10.5). Return types come from schema.org's TypeScript types (schema-dts),
// so a wrong property name or value is a compile error. Facts-based values arrive already verified (D13).
import type {
  Article,
  BreadcrumbList,
  FAQPage,
  ImageObject,
  LocalBusiness,
  Organization,
  Person,
  Service,
  WebSite,
  WithContext,
} from 'schema-dts'

export type Json = Record<string, unknown>

const CTX = 'https://schema.org' as const

export function organization(p: {
  name: string
  url: string
  logo?: string | null
  email?: string | null
  telephone?: string | null
}): WithContext<Organization> {
  return {
    '@context': CTX,
    '@type': 'Organization',
    name: p.name,
    url: p.url,
    ...(p.logo ? { logo: p.logo } : {}),
    ...(p.email ? { email: p.email } : {}),
    ...(p.telephone ? { telephone: p.telephone } : {}),
  }
}

export function website(p: { name: string; url: string }): WithContext<WebSite> {
  return { '@context': CTX, '@type': 'WebSite', name: p.name, url: p.url }
}

/** LocalBusiness only with verified address and telephone (SPEC §5.2). Returns null otherwise. */
export function localBusiness(p: {
  name: string
  url: string
  telephone: string | null
  address: string | null
  licenceNumber?: string | null
}): WithContext<LocalBusiness> | null {
  if (!p.telephone || !p.address) return null
  return {
    '@context': CTX,
    '@type': 'LocalBusiness',
    name: p.name,
    url: p.url,
    telephone: p.telephone,
    address: { '@type': 'PostalAddress', streetAddress: p.address, addressCountry: 'AE' },
    ...(p.licenceNumber ? { identifier: p.licenceNumber } : {}),
  }
}

export function breadcrumb(items: { name: string; url: string }[]): WithContext<BreadcrumbList> {
  return {
    '@context': CTX,
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
}): WithContext<Service> {
  return {
    '@context': CTX,
    '@type': 'Service',
    name: p.name,
    url: p.url,
    provider: { '@type': 'Organization', name: p.providerName },
    ...(p.description ? { description: p.description } : {}),
  }
}

/** FAQPage from eligible questions only (SPEC §5.2 `eligibleForSchema`). */
export function faqPage(
  faqs: { question: string; answer: string; eligible: boolean }[],
): WithContext<FAQPage> | null {
  const eligible = faqs.filter((f) => f.eligible && f.question && f.answer)
  if (eligible.length === 0) return null
  return {
    '@context': CTX,
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
}): WithContext<Person> | null {
  if (!p.consentGiven) return null
  return { '@context': CTX, '@type': 'Person', name: p.name, jobTitle: p.jobTitle, url: p.url }
}

export function article(p: {
  headline: string
  description?: string | null
  authorName?: string | null
  dateModified?: string | null
  image?: string | null
}): WithContext<Article> {
  return {
    '@context': CTX,
    '@type': 'Article',
    headline: p.headline,
    ...(p.description ? { description: p.description } : {}),
    ...(p.dateModified ? { dateModified: p.dateModified } : {}),
    ...(p.authorName ? { author: { '@type': 'Person', name: p.authorName } } : {}),
    ...(p.image ? { image: p.image } : {}),
  }
}

export function imageObject(p: {
  contentUrl: string
  name: string
  caption?: string | null
}): WithContext<ImageObject> {
  return {
    '@context': CTX,
    '@type': 'ImageObject',
    contentUrl: p.contentUrl,
    name: p.name,
    ...(p.caption ? { caption: p.caption } : {}),
  }
}

/** Required properties per type. Used by the structured-data test (not a Google validator). */
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
export function schemaProblems(obj: object): string[] {
  const o = obj as Json
  const rawType = o['@type']
  const type = typeof rawType === 'string' ? rawType : ''
  const required = REQUIRED[type]
  if (!required) return [`unknown type ${type || '(none)'}`]
  return required
    .filter((k) => o[k] === undefined || o[k] === null)
    .map((k) => `${type} is missing ${k}`)
}

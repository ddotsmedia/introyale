// Publish gates (SPEC §5.2, D13). Pure: the hook supplies resolved media and related counts.
export type GateError = { path: string; message: string }
export type MediaInfo = { alt?: string | null; usageApproved?: boolean | null } | null
export type GateContext = {
  media: (id: unknown) => MediaInfo
  publishedProofProjects: (serviceId: unknown) => number
}

type Doc = Record<string, unknown>
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
const obj = (v: unknown): Doc => (v && typeof v === 'object' ? (v as Doc) : {})

function checkSeo(doc: Doc, errs: GateError[]): void {
  const seo = obj(doc.seo)
  if (!str(seo.metaTitle))
    errs.push({ path: 'seo.metaTitle', message: 'Meta title is required to publish' })
  if (!str(seo.metaDescription))
    errs.push({ path: 'seo.metaDescription', message: 'Meta description is required to publish' })
}

function checkRequired(doc: Doc, fields: string[], errs: GateError[]): void {
  for (const f of fields) {
    const v = doc[f]
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) {
      errs.push({ path: f, message: `${f} is required to publish` })
    }
  }
}

function checkMediaAlt(id: unknown, path: string, ctx: GateContext, errs: GateError[]): void {
  if (id === undefined || id === null || id === '') return
  const m = ctx.media(id)
  if (!m || !str(m.alt))
    errs.push({ path, message: 'Every image needs alt text before publishing' })
}

export function publishGateErrors(collection: string, doc: Doc, ctx: GateContext): GateError[] {
  const errs: GateError[] = []
  switch (collection) {
    case 'projects': {
      checkRequired(doc, ['title', 'slug', 'sector', 'areaLabel', 'year', 'hero'], errs)
      if (doc.hero) {
        const info = ctx.media(doc.hero)
        if (!info || info.usageApproved !== true)
          errs.push({ path: 'hero', message: 'Hero image usage must be approved' })
        checkMediaAlt(doc.hero, 'hero', ctx, errs)
      }
      for (const id of Array.isArray(doc.gallery) ? doc.gallery : [])
        checkMediaAlt(id, 'gallery', ctx, errs)
      if (obj(doc.clientApproval).approved !== true)
        errs.push({ path: 'clientApproval.approved', message: 'Client approval is required' })
      checkSeo(doc, errs)
      break
    }
    case 'services': {
      if (doc.confirmed !== true)
        errs.push({ path: 'confirmed', message: 'Service must be confirmed before publishing' })
      if (ctx.publishedProofProjects(doc.id) < 1)
        errs.push({
          path: 'proofProjects',
          message: 'At least one published proof project is required',
        })
      checkRequired(doc, ['title', 'slug', 'summary'], errs)
      checkSeo(doc, errs)
      break
    }
    case 'team-members': {
      if (obj(doc.consent).given !== true)
        errs.push({ path: 'consent.given', message: 'Team member consent is required' })
      checkRequired(doc, ['name', 'role'], errs)
      checkMediaAlt(doc.photo, 'photo', ctx, errs)
      break
    }
    case 'testimonials': {
      if (obj(doc.permission).given !== true)
        errs.push({ path: 'permission.given', message: 'Testimonial permission is required' })
      checkRequired(doc, ['quote', 'attributionName'], errs)
      break
    }
    case 'journal-posts':
      checkRequired(doc, ['title', 'slug', 'excerpt', 'reviewedAt'], errs)
      checkMediaAlt(doc.heroImage, 'heroImage', ctx, errs)
      checkSeo(doc, errs)
      break
    case 'pages':
    case 'sectors':
      checkRequired(doc, ['title', 'slug'], errs)
      checkSeo(doc, errs)
      break
    default:
      break
  }
  return errs
}

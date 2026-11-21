import { describe, expect, it } from 'vitest'
import { publishGateErrors, type GateContext } from '../../src/lib/publishGates'

const media = (alt: string | null, usageApproved = true) => ({ alt, usageApproved })
const ctx = (over: Partial<GateContext> = {}): GateContext => ({
  media: (id) => (id === 'img-ok' ? media('Living room') : id === 'img-noalt' ? media('') : null),
  publishedProofProjects: () => 1,
  ...over,
})

const validProject = {
  title: 'Villa Saadiyat',
  slug: 'villa-saadiyat',
  sector: 'residential',
  areaLabel: 'Saadiyat',
  year: 2025,
  hero: 'img-ok',
  gallery: ['img-ok'],
  clientApproval: { approved: true },
  seo: { metaTitle: 'Villa', metaDescription: 'A villa refit' },
}

const paths = (errs: { path: string }[]) => errs.map((e) => e.path)

describe('publish gates', () => {
  it('passes a complete, approved project', () => {
    expect(publishGateErrors('projects', validProject, ctx())).toEqual([])
  })

  it('blocks a project without client approval', () => {
    const errs = publishGateErrors(
      'projects',
      { ...validProject, clientApproval: { approved: false } },
      ctx(),
    )
    expect(paths(errs)).toContain('clientApproval.approved')
  })

  it('blocks a hero whose usage is not approved', () => {
    const errs = publishGateErrors(
      'projects',
      validProject,
      ctx({ media: () => media('Hero', false) }),
    )
    expect(paths(errs)).toContain('hero')
  })

  it('blocks images without alt text', () => {
    const errs = publishGateErrors('projects', { ...validProject, gallery: ['img-noalt'] }, ctx())
    expect(paths(errs)).toContain('gallery')
  })

  it('blocks missing SEO title or description', () => {
    const errs = publishGateErrors('projects', { ...validProject, seo: {} }, ctx())
    expect(paths(errs)).toEqual(expect.arrayContaining(['seo.metaTitle', 'seo.metaDescription']))
  })

  it('blocks required-field gaps', () => {
    const errs = publishGateErrors('projects', { ...validProject, title: '  ' }, ctx())
    expect(paths(errs)).toContain('title')
  })

  it('requires a confirmed service with at least one published proof project', () => {
    const base = {
      title: 'Interiors',
      slug: 'interiors',
      summary: 'Full interiors',
      seo: { metaTitle: 'x', metaDescription: 'y' },
    }
    expect(paths(publishGateErrors('services', { ...base, confirmed: false }, ctx()))).toContain(
      'confirmed',
    )
    expect(
      paths(
        publishGateErrors(
          'services',
          { ...base, confirmed: true },
          ctx({ publishedProofProjects: () => 0 }),
        ),
      ),
    ).toContain('proofProjects')
    expect(publishGateErrors('services', { ...base, confirmed: true }, ctx())).toEqual([])
  })

  it('does not render team members without consent', () => {
    const member = { name: 'A', role: 'Designer', consent: { given: false } }
    expect(paths(publishGateErrors('team-members', member, ctx()))).toContain('consent.given')
    expect(
      publishGateErrors('team-members', { ...member, consent: { given: true } }, ctx()),
    ).toEqual([])
  })

  it('does not render testimonials without permission', () => {
    const t = { quote: 'Great', attributionName: 'Client', permission: { given: false } }
    expect(paths(publishGateErrors('testimonials', t, ctx()))).toContain('permission.given')
  })

  it('has no gates for collections without publish rules', () => {
    expect(publishGateErrors('faqs', {}, ctx())).toEqual([])
  })
})

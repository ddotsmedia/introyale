import { describe, expect, it } from 'vitest'
import {
  breadcrumb,
  faqPage,
  localBusiness,
  organization,
  person,
  schemaProblems,
  service,
  website,
  article,
  imageObject,
} from '../../src/lib/schema'

const URL = 'https://introyale.test'

describe('JSON-LD builders (M9)', () => {
  it('every built object carries its required properties', () => {
    const objects = [
      organization({ name: 'Introyale Interiors', url: URL, telephone: '+971 52 77 54 585' }),
      website({ name: 'Introyale Interiors', url: URL }),
      breadcrumb([{ name: 'Home', url: URL }]),
      service({
        name: 'Interiors',
        url: `${URL}/services/interiors`,
        providerName: 'Introyale Interiors',
      }),
      article({ headline: 'Materials' }),
      imageObject({ contentUrl: `${URL}/media/a.webp`, name: 'Hero' }),
    ]
    for (const o of objects) expect(schemaProblems(o)).toEqual([])
  })

  it('emits LocalBusiness only with verified address and telephone', () => {
    expect(localBusiness({ name: 'X', url: URL, telephone: null, address: 'Abu Dhabi' })).toBeNull()
    expect(localBusiness({ name: 'X', url: URL, telephone: '+971', address: null })).toBeNull()
    const lb = localBusiness({ name: 'X', url: URL, telephone: '+971', address: 'Abu Dhabi' })
    expect(lb).not.toBeNull()
    if (lb) expect(schemaProblems(lb)).toEqual([])
  })

  it('emits Person only with consent', () => {
    expect(person({ name: 'A', jobTitle: 'Designer', url: URL, consentGiven: false })).toBeNull()
    expect(person({ name: 'A', jobTitle: 'Designer', url: URL, consentGiven: true })).not.toBeNull()
  })

  it('lists only eligible FAQs, and omits the block when none are eligible', () => {
    expect(faqPage([{ question: 'Q', answer: 'A', eligible: false }])).toBeNull()
    const page = faqPage([
      { question: 'Q1', answer: 'A1', eligible: true },
      { question: 'Q2', answer: 'A2', eligible: false },
    ])
    expect(page && (page.mainEntity as unknown[]).length).toBe(1)
  })

  it('reports a missing required property', () => {
    expect(schemaProblems({ '@type': 'Organization', name: 'X' })).toEqual([
      'Organization is missing url',
    ])
  })

  it('omits empty optional fields instead of emitting nulls', () => {
    const o = organization({ name: 'X', url: URL, logo: null, email: '' })
    expect(Object.keys(o)).not.toContain('logo')
    expect(Object.keys(o)).not.toContain('email')
  })
})

import { describe, expect, it } from 'vitest'
import { elapsedEnough, honeypotTripped, signStartedAt, MIN_ELAPSED_MS } from '../../src/lib/bot'
import { sanitizeText } from '../../src/lib/sanitize'
import { consultationSchema, contactSchema, fieldErrors } from '../../src/lib/validation/enquiry'

const KEY = 'test-key'

const validConsultation = {
  type: 'consultation',
  sector: 'residential',
  projectType: 'Refurbishment',
  location: 'Saadiyat',
  propertyType: 'Apartment',
  approxArea: '120 m²',
  services: ['Interior design'],
  stage: 'design',
  targetStart: 'Q1 2027',
  budgetBand: '',
  brief: 'Open-plan kitchen.',
  plansLink: '',
  name: 'Test Lead',
  email: 'lead@example.test',
  phone: '',
  preferredMethod: 'email',
  preferredTime: '',
  consent: true,
  sourcePage: '/start',
}

describe('sanitizeText', () => {
  it('strips tags and control characters and collapses spaces', () => {
    expect(sanitizeText('  <b>Hello</b>\u0007   world  ')).toBe('Hello world')
  })
})

describe('consultationSchema', () => {
  it('accepts a complete, consented request', () => {
    expect(consultationSchema.safeParse(validConsultation).success).toBe(true)
  })

  it('requires consent', () => {
    const r = consultationSchema.safeParse({ ...validConsultation, consent: undefined })
    expect(r.success).toBe(false)
  })

  it('rejects an unknown sector', () => {
    const r = consultationSchema.safeParse({ ...validConsultation, sector: 'industrial' })
    expect(r.success).toBe(false)
  })

  it('rejects an invalid email with a field-level message', () => {
    const r = consultationSchema.safeParse({ ...validConsultation, email: 'not-an-email' })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error).email).toBe('Enter a valid email')
  })

  it('only accepts https plan links', () => {
    expect(
      consultationSchema.safeParse({ ...validConsultation, plansLink: 'http://x.test' }).success,
    ).toBe(false)
    expect(
      consultationSchema.safeParse({ ...validConsultation, plansLink: 'https://x.test/plan.pdf' })
        .success,
    ).toBe(true)
  })

  it('strips HTML from the brief before checking length', () => {
    const r = consultationSchema.safeParse({
      ...validConsultation,
      brief: '<script>alert(1)</script>Kitchen',
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.brief).not.toContain('<script>')
  })
})

describe('contactSchema', () => {
  it('requires a message and consent', () => {
    const r = contactSchema.safeParse({
      type: 'general',
      name: 'A',
      email: 'a@example.test',
      phone: '',
      message: '',
      consent: true,
      sourcePage: '/contact',
    })
    expect(r.success).toBe(false)
  })
})

describe('bot checks', () => {
  it('flags a filled honeypot', () => {
    expect(honeypotTripped('spam')).toBe(true)
    expect(honeypotTripped('')).toBe(false)
    expect(honeypotTripped(undefined)).toBe(false)
  })

  it('requires the minimum elapsed time', () => {
    const t0 = 1_000_000
    const token = signStartedAt(t0, KEY)
    expect(elapsedEnough(token, KEY, t0 + MIN_ELAPSED_MS - 1)).toBe(false)
    expect(elapsedEnough(token, KEY, t0 + MIN_ELAPSED_MS)).toBe(true)
  })

  it('rejects a forged or re-signed timestamp', () => {
    const token = signStartedAt(1_000_000, KEY)
    const [, sig] = token.split('.')
    expect(elapsedEnough(`0.${sig ?? ''}`, KEY, 9_000_000)).toBe(false)
    expect(elapsedEnough(token, 'other-key', 9_000_000)).toBe(false)
    expect(elapsedEnough(undefined, KEY)).toBe(false)
  })
})

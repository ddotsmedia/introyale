import { describe, expect, it } from 'vitest'
import { umamiData } from '../../src/admin/umami'
import { LABELS } from '../../src/admin/labels'
import { seoField } from '../../src/fields/common'
import { signPreview, verifyPreview } from '../../src/lib/previewToken'

describe('admin polish', () => {
  it('hides the Umami card when it is not configured', async () => {
    delete process.env.UMAMI_URL
    expect(await umamiData()).toBeNull()
  })

  it('Arabic labels cover every English key', () => {
    expect(Object.keys(LABELS.ar).sort()).toEqual(Object.keys(LABELS.en).sort())
  })

  it('the SEO group carries the panel and a focus keyword field', () => {
    const names = (seoField as { fields: { name: string }[] }).fields.map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['focusKeyword', 'panel']))
  })

  it('live-preview tokens cover the home global', () => {
    const t = signPreview({ c: 'home-page', id: 0, exp: Date.now() + 1000 }, 'a'.repeat(32))
    expect(verifyPreview(t, 'a'.repeat(32))?.c).toBe('home-page')
  })
})

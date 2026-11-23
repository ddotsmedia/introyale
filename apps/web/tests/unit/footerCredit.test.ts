import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Footer } from '../../src/components/Footer'

const base = {
  brand: 'Brand',
  columns: [],
  legal: [],
  address: null,
  phone: null,
  whatsappHref: null,
  email: null,
  social: [],
}

describe('footer developer credit', () => {
  it('renders the credit name as a safe external link', () => {
    const html = renderToStaticMarkup(
      createElement(Footer, {
        ...base,
        credit: {
          text: 'Built and managed by',
          name: 'Ddotsmedia Technologies LLC',
          url: 'https://ddotsmedia.com',
        },
      }),
    )
    expect(html).toContain('Built and managed by')
    expect(html).toMatch(
      /<a href="https:\/\/ddotsmedia\.com"[^>]*target="_blank"[^>]*rel="noopener"[^>]*>Ddotsmedia Technologies LLC<\/a>/,
    )
    expect(html).toContain('md:text-end')
  })
  it('renders nothing when the credit is off', () => {
    expect(renderToStaticMarkup(createElement(Footer, { ...base, credit: null }))).not.toContain(
      'Ddotsmedia',
    )
  })
})

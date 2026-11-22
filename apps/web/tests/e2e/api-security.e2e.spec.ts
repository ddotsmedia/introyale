import { expect, test, request as pwRequest } from '@playwright/test'

// No-cookie security regression: an anonymous client gets 401/403 (or nothing) from every private endpoint and only
// published/verified data from the public ones. Runs in CI and, with E2E_BASE_URL, against the live site (read-only).
const PRIVATE = [
  '/api/enquiries',
  '/api/users',
  '/api/audit-log',
  '/api/notifications',
  '/api/login-history',
  '/api/saved-views',
  '/api/redirects',
  '/api/rate-limits',
  '/api/email-templates',
  '/api/not-found-log',
  '/api/payload-preferences',
]
const PUBLISHED_ONLY = [
  'pages',
  'projects',
  'services',
  'sectors',
  'journal-posts',
  'team-members',
  'testimonials',
]

test.describe('anonymous API access', () => {
  test.beforeEach(({ browserName: _browser }, info) => {
    test.skip(info.project.name !== 'desktop', 'API checks run once')
  })

  for (const path of PRIVATE) {
    test(`GET ${path} is denied`, async ({ request }) => {
      const res = await request.get(path)
      expect([401, 403]).toContain(res.status())
      expect(await res.text()).not.toMatch(/"docs"\s*:\s*\[\s*\{/)
    })
  }

  test('anonymous /api/users/me has no user', async ({ request }) => {
    const res = await request.get('/api/users/me')
    const body = (await res.json()) as { user?: unknown }
    expect(body.user ?? null).toBeNull()
  })

  for (const c of PUBLISHED_ONLY) {
    test(`GET /api/${c} returns published documents only`, async ({ request }) => {
      const res = await request.get(`/api/${c}?limit=300&depth=0`)
      expect(res.status()).toBe(200)
      const body = (await res.json()) as { docs: { workflow?: { status?: string } }[] }
      for (const d of body.docs) expect(d.workflow?.status).toBe('published')
    })
  }

  test('GET /api/facts returns verified facts only', async ({ request }) => {
    const res = await request.get('/api/facts?limit=300&depth=0')
    expect(res.status()).toBe(200)
    const body = (await res.json()) as { docs: { status?: string }[] }
    for (const d of body.docs) expect(d.status).toBe('verified')
  })

  test('GET /api/media never lists confidential or unapproved files', async ({ request }) => {
    const res = await request.get('/api/media?limit=300&depth=0')
    expect(res.status()).toBe(200)
    const body = (await res.json()) as {
      docs: { confidential?: boolean; usageApproved?: boolean }[]
    }
    for (const d of body.docs) {
      expect(d.confidential).not.toBe(true)
      expect(d.usageApproved).toBe(true)
    }
  })

  test('POST /api/graphql returns no private data', async ({ request }) => {
    for (const q of [
      '{ Enquiries { totalDocs docs { id } } }',
      '{ Users { totalDocs docs { email } } }',
      '{ AuditLogs { totalDocs } }',
      '{ Notifications { totalDocs } }',
      '{ LoginHistories { totalDocs } }',
      '{ Facts { totalDocs docs { key status } } }',
      '{ Pages { totalDocs docs { slug } } }',
    ]) {
      const res = await request.post('/api/graphql', { data: { query: q } })
      const text = await res.text()
      // GraphQL is either not exposed (404) or access-checked; never private documents.
      expect([200, 400, 401, 403, 404]).toContain(res.status())
      expect(text).not.toMatch(/"email"\s*:/)
      expect(text).not.toMatch(/"docs"\s*:\s*\[\s*\{/)
    }
  })

  test('writes without a session are rejected', async ({ request }) => {
    const attempts: [string, object][] = [
      ['/api/users', { email: 'x@example.com', password: 'x', role: 'administrator' }],
      ['/api/pages', { title: 'x', slug: 'x' }],
      ['/api/facts', { key: 'x', value: 'x' }],
    ]
    for (const [path, data] of attempts) {
      const res = await request.post(path, { data })
      expect([401, 403]).toContain(res.status())
    }
  })
})

// Drafts and unverified facts exist only where we can create them (the CI stack's e2e administrator).
test('drafts and unverified facts are invisible to anonymous clients', async ({
  request,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'runs once')
  const pw = process.env.E2E_ADMIN_PW
  test.skip(!pw, 'needs E2E_ADMIN_PW to create the draft records')
  const admin = await pwRequest.newContext({ baseURL: String(info.project.use.baseURL) })
  const login = await admin.post('/api/users/login', {
    data: { email: process.env.E2E_API_EMAIL ?? 'e2e-api@introyale.local', password: pw },
  })
  expect(login.ok()).toBe(true)
  const tag = `e2e-secret-${String(Date.now())}`
  const page = await admin.post('/api/pages', { data: { title: tag, slug: tag } })
  const fact = await admin.post('/api/facts', {
    data: { key: tag, value: tag, status: 'unverified' },
  })
  try {
    expect(page.ok(), await page.text()).toBe(true)
    expect(fact.ok(), await fact.text()).toBe(true)
    const pid = ((await page.json()) as { doc: { id: number } }).doc.id
    const fid = ((await fact.json()) as { doc: { id: number } }).doc.id
    // The administrator sees the draft...
    const mine = await admin.get(`/api/pages?where[slug][equals]=${tag}`)
    expect(((await mine.json()) as { totalDocs: number }).totalDocs).toBe(1)
    // ...an anonymous client cannot: not in lists, not by id, not through GraphQL.
    for (const url of [
      `/api/pages?where[slug][equals]=${tag}`,
      '/api/pages?limit=300',
      '/api/facts?limit=300',
    ]) {
      expect(await (await request.get(url)).text()).not.toContain(tag)
    }
    for (const url of [`/api/pages/${String(pid)}`, `/api/facts/${String(fid)}`]) {
      const res = await request.get(url)
      expect([401, 403, 404]).toContain(res.status())
      expect(await res.text()).not.toContain(tag)
    }
    const gql = await request.post('/api/graphql', {
      data: { query: `{ Pages(where: { slug: { equals: "${tag}" } }) { docs { id } } }` },
    })
    expect(await gql.text()).not.toContain(tag)
  } finally {
    if (page.ok()) {
      await admin.delete(
        `/api/pages/${String(((await page.json()) as { doc: { id: number } }).doc.id)}`,
      )
    }
    if (fact.ok()) {
      await admin.delete(
        `/api/facts/${String(((await fact.json()) as { doc: { id: number } }).doc.id)}`,
      )
    }
    await admin.dispose()
  }
})

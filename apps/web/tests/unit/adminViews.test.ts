import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkDoc, scoreFor } from '../../src/admin/health'
import { signPreview, verifyPreview } from '../../src/lib/previewToken'
import { can, ROLES, type Action, type Role } from '../../src/lib/roles'

const VIEWS = path.resolve(__dirname, '../../src/admin/views')

/** Each custom view and the action its server-side Shell requires. The dashboard filters widgets per role instead. */
const EXPECTED: Record<string, { action: Action | null; allow: Role[] }> = {
  'LeadsBoard.tsx': {
    action: 'enquiries.read',
    allow: ['administrator', 'marketing_reviewer', 'publisher'],
  },
  'LeadsTable.tsx': {
    action: 'enquiries.read',
    allow: ['administrator', 'marketing_reviewer', 'publisher'],
  },
  'LeadDetail.tsx': {
    action: 'enquiries.read',
    allow: ['administrator', 'marketing_reviewer', 'publisher'],
  },
  'Workflow.tsx': { action: 'comment', allow: [...ROLES] },
  'ContentHealth.tsx': { action: 'content.health', allow: [...ROLES] },
  'MediaLibrary.tsx': { action: 'comment', allow: [...ROLES] },
  'SiteTools.tsx': { action: 'redirects.manage', allow: ['administrator', 'marketing_reviewer'] },
  'System.tsx': { action: 'system.view', allow: ['administrator'] },
  'Security.tsx': { action: 'users.manage', allow: ['administrator'] },
  'Audit.tsx': { action: 'users.manage', allow: ['administrator'] },
  'Dashboard.tsx': { action: null, allow: [...ROLES] },
}

describe('admin views enforce role access on the server (SPEC §5.4)', () => {
  for (const [file, exp] of Object.entries(EXPECTED)) {
    it(`${file} declares ${exp.action ?? 'per-widget'} access`, () => {
      const src = fs.readFileSync(path.join(VIEWS, file), 'utf8')
      expect(src).toContain('<Shell')
      const m = /action="([^"]+)"/.exec(src)
      expect(m?.[1] ?? null).toBe(exp.action)
    })
    if (exp.action) {
      for (const role of ROLES) {
        it(`${file}: ${role} is ${exp.allow.includes(role) ? 'allowed' : 'denied'}`, () => {
          expect(can(role, exp.action as Action)).toBe(exp.allow.includes(role))
        })
      }
    }
  }

  it('every server action authenticates through session()', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../src/admin/actions.ts'), 'utf8')
    const fns = src.match(/export async function \w+/g) ?? []
    expect(fns.length).toBeGreaterThan(10)
    for (const chunk of src.split('export async function ').slice(1)) {
      expect(chunk.slice(0, 600)).toContain('session(')
    }
  })

  it('CSV routes are administrator only', () => {
    for (const r of ['leads-csv', 'audit-csv']) {
      const src = fs.readFileSync(
        path.resolve(__dirname, `../../src/app/(payload)/api/admin-tools/${r}/route.ts`),
        'utf8',
      )
      expect(src).toContain("session('users.manage')")
    }
  })
})

describe('draft preview tokens', () => {
  const secret = 'test-secret-test-secret-test-secret'
  it('verifies a fresh token', () => {
    const t = signPreview({ c: 'pages', id: 4, exp: Date.now() + 60_000 }, secret)
    expect(verifyPreview(t, secret)?.id).toBe(4)
  })
  it('rejects an expired token', () => {
    const t = signPreview({ c: 'pages', id: 4, exp: Date.now() - 1 }, secret)
    expect(verifyPreview(t, secret)).toBeNull()
  })
  it('rejects a tampered or wrongly signed token', () => {
    const t = signPreview({ c: 'projects', id: 4, exp: Date.now() + 60_000 }, secret)
    expect(verifyPreview(t, 'another-secret-another-secret-xx')).toBeNull()
    const [body, sig] = t.split('.')
    const forged = Buffer.from(
      JSON.stringify({ c: 'projects', id: 5, exp: Date.now() + 60_000 }),
    ).toString('base64url')
    expect(verifyPreview(`${forged}.${sig ?? ''}`, secret)).toBeNull()
    expect(verifyPreview(body ?? '', secret)).toBeNull()
  })
})

describe('content health detection', () => {
  const routes = new Set(['/', '/work', '/services/clubhouses'])
  const media = new Map([[7, { width: 1200, alt: 'x' }]])
  const kinds = (c: string, d: Record<string, unknown>) =>
    checkDoc(c, { id: 1, ...d }, { routes, media }).map((i) => i.kind)

  it('flags missing SEO, [CONFIRM], low-resolution hero, empty sections and broken links', () => {
    const issues = kinds('projects', {
      title: '[CONFIRM] name',
      seo: {},
      hero: 7,
      workflow: { status: 'published' },
      layout: [{ blockType: 'textSection', hidden: false }],
      cta: { href: '/nowhere' },
    })
    expect(issues).toEqual(
      expect.arrayContaining(['seo', 'confirm', 'lowres', 'approval', 'empty', 'link']),
    )
  })

  it('passes a clean document with a full score', () => {
    const d = {
      title: 'Ok',
      seo: { metaTitle: 'T', metaDescription: 'D' },
      cta: { href: '/work?x=1' },
    }
    expect(kinds('pages', d)).toEqual([])
    expect(scoreFor([])).toBe(100)
  })
})

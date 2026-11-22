import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { slaFor } from '../../src/lib/crmPlus'
import { defaultLayout, resolveLayout, WIDGETS } from '../../src/admin/widgets'
import { can, ROLES } from '../../src/lib/roles'

// Monday 2026-11-23, Dubai time = UTC+4. Business hours are Mon-Fri 09:00-18:00.
const created = '2026-11-23T06:00:00Z' // 10:00 Dubai
const at = (hhDubai: number) =>
  new Date(`2026-11-23T${String(hhDubai - 4).padStart(2, '0')}:00:00Z`)

describe('first-response SLA', () => {
  it('is ok early, due at 75% of the allowance and breached after it', () => {
    expect(slaFor({ createdAt: created }, 4, at(11)).state).toBe('ok')
    expect(slaFor({ createdAt: created }, 4, at(13)).state).toBe('due')
    expect(slaFor({ createdAt: created }, 4, at(16)).state).toBe('breached')
  })
  it('stops the clock at first contact and says whether the target was met', () => {
    expect(
      slaFor({ createdAt: created, firstContactAt: at(12).toISOString() }, 4, at(17)),
    ).toMatchObject({
      state: 'met',
      hours: 2,
    })
    expect(slaFor({ createdAt: created, firstContactAt: at(17).toISOString() }, 4).state).toBe(
      'late',
    )
  })
  it('does not count evenings or weekends', () => {
    const friday = '2026-11-27T13:00:00Z' // 17:00 Dubai on Friday
    expect(slaFor({ createdAt: friday }, 4, new Date('2026-11-30T06:00:00Z')).hours).toBe(2) // 17:00-18:00 + Monday 09:00-10:00
  })
})

describe('dashboard layout', () => {
  it('gives each role a sensible default and only widgets the role may see', () => {
    for (const role of ROLES) {
      const l = defaultLayout(role)
      const allowed = WIDGETS.filter((w) => w.show(role)).map((w) => w.id)
      expect(
        l.order.every((id) => allowed.includes(id)),
        role,
      ).toBe(true)
      expect(l.order.length).toBeGreaterThan(0)
    }
    expect(defaultLayout('content_editor').order).not.toContain('exec')
    expect(defaultLayout('administrator').order).toContain('leaderboard')
    expect(defaultLayout('marketing_reviewer').order).not.toContain('leaderboard')
  })
  it('keeps a saved order, drops unknown and forbidden ids, and respects hidden', () => {
    const saved = {
      order: ['activity', 'bogus', 'leaderboard', 'content'],
      hidden: ['content', 'nope'],
    }
    const l = resolveLayout(saved, 'content_editor')
    expect(l.order.slice(0, 1)).toEqual(['activity'])
    expect(l.order).not.toContain('bogus')
    expect(l.order).not.toContain('leaderboard') // admin-only widget cannot be forced in
    expect(l.hidden).toEqual(['content'])
  })
  it('falls back to the default for missing or malformed layouts', () => {
    expect(resolveLayout(null, 'administrator')).toEqual(defaultLayout('administrator'))
    expect(resolveLayout({ order: 'x' }, 'administrator')).toEqual(defaultLayout('administrator'))
  })
  it('widget visibility follows the role matrix', () => {
    const byId = new Map(WIDGETS.map((w) => [w.id, w]))
    expect(byId.get('traffic')?.show('content_editor')).toBe(
      can('content_editor', 'analytics.view'),
    )
    expect(byId.get('exec')?.show('publisher')).toBe(true)
    expect(byId.get('health')?.show('publisher')).toBe(false)
  })
})

describe('admin v3 access', () => {
  it('analytics and CSV export require analytics.view; new routes authenticate through session()', () => {
    const root = path.resolve(__dirname, '../../src')
    for (const f of ['analytics-csv', 'search', 'insights']) {
      const src = fs.readFileSync(
        path.join(root, `app/(payload)/api/admin-tools/${f}/route.ts`),
        'utf8',
      )
      expect(src).toContain('session(')
      expect(src).toContain('Forbidden')
    }
    expect(
      fs.readFileSync(
        path.join(root, 'app/(payload)/api/admin-tools/analytics-csv/route.ts'),
        'utf8',
      ),
    ).toContain("session('analytics.view')")
    expect(can('content_editor', 'analytics.view')).toBe(false)
    expect(can('administrator', 'analytics.view')).toBe(true)
  })
  it('the collect endpoint is public but never stores staff, opted-out visitors or bots', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../src/app/api/a/collect/route.ts'),
      'utf8',
    )
    for (const needle of ['optedOut(', 'isBot(', 'payload-token', 'MAX_BODY', 'hitRateLimit('])
      expect(src).toContain(needle)
  })
})

import { describe, expect, it } from 'vitest'
import { can, type Action, type Role } from '../../src/lib/roles'

// Expected matrix transcribed from SPEC §5.4. Each row: action → roles allowed.
const EXPECTED: Record<Action, Role[]> = {
  'content.write': ['administrator', 'content_editor', 'publisher'],
  'project.write': ['administrator', 'project_editor', 'publisher'],
  'media.write': ['administrator', 'project_editor', 'publisher'],
  'workflow.submit': ['administrator', 'content_editor', 'project_editor', 'publisher'],
  'workflow.approve': ['administrator', 'marketing_reviewer', 'publisher'],
  'workflow.publish': ['administrator', 'publisher'],
  'facts.verify': ['administrator', 'publisher'],
  'enquiries.read': ['administrator', 'marketing_reviewer', 'publisher'],
  'users.manage': ['administrator'],
  'redirects.manage': ['administrator', 'marketing_reviewer'],
  'globals.manage': ['administrator'],
  'system.view': ['administrator'],
  'analytics.view': ['administrator', 'marketing_reviewer', 'publisher'],
  'content.health': [
    'administrator',
    'content_editor',
    'project_editor',
    'marketing_reviewer',
    'publisher',
  ],
  comment: ['administrator', 'content_editor', 'project_editor', 'marketing_reviewer', 'publisher'],
}

const ROLES: Role[] = [
  'administrator',
  'content_editor',
  'project_editor',
  'marketing_reviewer',
  'publisher',
]

describe('role matrix (SPEC §5.4)', () => {
  for (const [action, allowed] of Object.entries(EXPECTED) as [Action, Role[]][]) {
    for (const role of ROLES) {
      it(`${role} ${allowed.includes(role) ? 'may' : 'may not'} ${action}`, () => {
        expect(can(role, action)).toBe(allowed.includes(role))
      })
    }
  }

  it('denies missing or unknown roles', () => {
    expect(can(undefined, 'content.write')).toBe(false)
    expect(can(null, 'content.write')).toBe(false)
  })
})

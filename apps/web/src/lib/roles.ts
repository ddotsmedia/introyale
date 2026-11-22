// Role matrix from SPEC §5.4 and D10. Single source for collection access and tests.
export const ROLES = [
  'administrator',
  'content_editor',
  'project_editor',
  'marketing_reviewer',
  'publisher',
] as const
export type Role = (typeof ROLES)[number]

export type Action =
  | 'content.write'
  | 'project.write'
  | 'media.write'
  | 'workflow.submit'
  | 'workflow.approve'
  | 'workflow.publish'
  | 'facts.verify'
  | 'enquiries.read'
  | 'users.manage'
  | 'redirects.manage'
  | 'globals.manage'
  | 'comment'
  | 'system.view'
  | 'content.health'
  | 'analytics.view'

const MATRIX: Record<Action, readonly Role[]> = {
  'content.write': ['administrator', 'content_editor', 'publisher'],
  'project.write': ['administrator', 'project_editor', 'publisher'],
  'media.write': ['administrator', 'project_editor', 'publisher'],
  'workflow.submit': ['administrator', 'content_editor', 'project_editor', 'publisher'],
  'workflow.approve': ['administrator', 'marketing_reviewer', 'publisher'],
  'workflow.publish': ['administrator', 'publisher'],
  'facts.verify': ['administrator', 'publisher'],
  // Non-admins read only enquiries assigned to them (enforced in access.ts).
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

export function can(role: Role | undefined | null, action: Action): boolean {
  return !!role && MATRIX[action].includes(role)
}

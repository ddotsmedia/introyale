import { can, type Action, type Role } from './roles'

export const STATUSES = ['draft', 'in_review', 'approved', 'published'] as const
export type Status = (typeof STATUSES)[number]

// Allowed transitions and the role-matrix action that permits each one (SPEC §5.4).
const TRANSITIONS: Record<Status, Partial<Record<Status, Action>>> = {
  draft: { in_review: 'workflow.submit' },
  in_review: { draft: 'workflow.approve', approved: 'workflow.approve' },
  approved: { in_review: 'workflow.submit', published: 'workflow.publish' },
  published: { draft: 'workflow.publish' },
}

export type TransitionResult = { ok: true } | { ok: false; reason: string }

export function checkTransition(
  from: Status | undefined,
  to: Status | undefined,
  role: Role | undefined,
): TransitionResult {
  const start: Status = from ?? 'draft'
  const end: Status = to ?? 'draft'
  if (start === end) return { ok: true }
  const action = TRANSITIONS[start][end]
  if (!action) return { ok: false, reason: `transition ${start} -> ${end} is not allowed` }
  if (!can(role, action)) return { ok: false, reason: `role may not move ${start} -> ${end}` }
  return { ok: true }
}

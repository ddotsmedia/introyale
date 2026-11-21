import { Forbidden, ValidationError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
} from 'payload'
import { publishGateErrors, type GateContext, type MediaInfo } from '../lib/publishGates'
import { checkTransition, type Status } from '../lib/workflow'
import { revalidateFor } from '../lib/revalidate'
import type { Role } from '../lib/roles'

type Doc = Record<string, unknown> & { id?: unknown; workflow?: { status?: Status } }
type WorkflowData = Doc & { workflow?: Record<string, unknown> & { status?: Status } }

/** Enforces role-based transitions and records actor fields (SPEC §5.1, §5.4). */
export const workflowGuard: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const next = data as WorkflowData
  const from = (originalDoc as Doc | undefined)?.workflow?.status
  const to = next.workflow?.status
  if (from === to) return data
  const role = (req.user as { role?: Role } | null)?.role
  const result = checkTransition(from, to, role)
  if (!result.ok) throw new Forbidden(req.t)
  const actor = req.user?.id
  const wf = { ...(next.workflow ?? {}) }
  if (to === 'in_review') wf.submittedBy = actor
  if (to === 'approved' || to === 'draft') wf.reviewedBy = actor
  if (to === 'approved') wf.approvedBy = actor
  if (to === 'published') wf.publishedBy = actor
  return { ...next, workflow: wf }
}

/** Runs publish gates before any transition to `published` (SPEC §5.2, D13). */
export const publishGuard: CollectionBeforeChangeHook = async ({ data, req, collection }) => {
  const doc = data as WorkflowData
  if (doc.workflow?.status !== 'published') return data

  const mediaIds = new Set<string>()
  for (const key of ['hero', 'heroImage', 'photo']) {
    const v = doc[key]
    if (typeof v === 'string' || typeof v === 'number') mediaIds.add(String(v))
  }
  for (const id of Array.isArray(doc.gallery) ? doc.gallery : []) mediaIds.add(String(id))
  const mediaMap = new Map<string, MediaInfo>()
  for (const id of mediaIds) {
    try {
      const m = await req.payload.findByID({
        collection: 'media',
        id,
        depth: 0,
        overrideAccess: true,
        req,
      })
      mediaMap.set(id, { alt: m.alt, usageApproved: m.usageApproved })
    } catch {
      mediaMap.set(id, null)
    }
  }

  let proofCount = 0
  if (collection.slug === 'services' && doc.id) {
    const found = await req.payload.count({
      collection: 'projects',
      where: {
        and: [{ services: { contains: doc.id } }, { 'workflow.status': { equals: 'published' } }],
      },
      overrideAccess: true,
      req,
    })
    proofCount = found.totalDocs
  }

  const ctx: GateContext = {
    media: (id) => mediaMap.get(String(id)) ?? null,
    publishedProofProjects: () => proofCount,
  }
  const errors = publishGateErrors(collection.slug, doc, ctx)
  if (errors.length) {
    throw new ValidationError({
      collection: collection.slug,
      errors: errors.map((e) => ({ message: e.message, path: e.path })),
      req,
    })
  }
  return data
}

/** Every create, update and delete writes an append-only audit entry (SPEC §5.2). */
export const auditAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  collection,
  operation,
}) => {
  if (collection.slug === 'audit-log') return doc as Doc
  await revalidateFor(collection.slug, doc as Record<string, unknown>)
  const fromStatus = (previousDoc as Doc | undefined)?.workflow?.status ?? null
  const toStatus = (doc as Doc).workflow?.status ?? null
  await req.payload.create({
    collection: 'audit-log',
    overrideAccess: true,
    req,
    data: {
      actor: req.user?.id ?? null,
      action: operation,
      collection: collection.slug,
      docId: String((doc as Doc).id),
      fromStatus,
      toStatus,
      diffSummary: operation === 'update' ? 'fields changed' : operation,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      at: new Date().toISOString(),
    },
  })
  return doc as Doc
}

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  await req.payload.create({
    collection: 'audit-log',
    overrideAccess: true,
    req,
    data: {
      actor: req.user?.id ?? null,
      action: 'delete',
      collection: collection.slug,
      docId: String((doc as Doc).id),
      diffSummary: 'deleted',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      at: new Date().toISOString(),
    },
  })
  return doc as Doc
}

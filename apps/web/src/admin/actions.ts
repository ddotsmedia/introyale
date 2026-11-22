'use server'
import { revalidatePath } from 'next/cache'
import { mailer, FROM, shell } from '../lib/mail'
import { notify, writeAudit } from '../lib/audit'
import * as crm from '../lib/crm'
import { signPreview } from '../lib/previewToken'
import { getRedirectMap, invalidateRedirects } from '../lib/redirects'
import { readSecret } from '../lib/secrets'
import { checkTransition, type Status } from '../lib/workflow'
import { WORKFLOW_COLLECTIONS } from './data'
import { session } from './session'

export type Result = { ok: boolean; message: string; data?: string }
const ok = (message: string, data?: string): Result => ({ ok: true, message, data })
const fail = (e: unknown): Result => ({
  ok: false,
  message: e instanceof Error ? e.message : 'Failed',
})
const num = (v: FormDataEntryValue | null): number => Number(v)
const str = (v: FormDataEntryValue | null): string => (typeof v === 'string' ? v : '')

// ---------- notifications ----------
export async function markAllRead(): Promise<void> {
  const { payload, user } = await session()
  await payload.update({
    collection: 'notifications',
    where: { and: [{ user: { equals: user.id } }, { read: { equals: false } }] },
    data: { read: true },
    overrideAccess: true,
  })
  revalidatePath('/admin')
}

// ---------- leads ----------
export async function moveLead(id: number, status: string, lostReason?: string): Promise<Result> {
  try {
    const { payload, user } = await session('enquiries.read')
    await crm.changeStatus(payload, user, id, status, lostReason)
    revalidatePath('/admin/leads-board')
    return ok('Moved')
  } catch (e) {
    return fail(e)
  }
}

/** Lead detail form: assignment, priority, follow-up, value and tags in one submit. */
export async function saveLead(fd: FormData): Promise<void> {
  const { payload, user } = await session('enquiries.read')
  const id = num(fd.get('id'))
  const status = str(fd.get('status'))
  if (status) await crm.changeStatus(payload, user, id, status, str(fd.get('lostReason')))
  if (user.role === 'administrator' && fd.has('assignedTo')) {
    const a = str(fd.get('assignedTo'))
    await crm.assignLead(payload, user, id, a ? Number(a) : null)
  }
  const fu = str(fd.get('followUpAt'))
  const ev = str(fd.get('estimatedValue'))
  await crm.updateLead(payload, user, id, {
    priority: str(fd.get('priority')),
    followUpAt: fu ? new Date(fu).toISOString() : null,
    estimatedValue: ev ? Number(ev) : null,
    tags: str(fd.get('tags'))
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  })
  revalidatePath('/admin/lead')
}

export async function addLeadNote(fd: FormData): Promise<void> {
  const { payload, user } = await session('enquiries.read')
  await crm.addNote(payload, user, num(fd.get('id')), str(fd.get('text')))
  revalidatePath('/admin/lead')
}

export async function replyToLead(fd: FormData): Promise<void> {
  const { payload, user } = await session('enquiries.read')
  const tpl = str(fd.get('templateId'))
  await crm.sendReply(
    payload,
    user,
    num(fd.get('id')),
    tpl
      ? { templateId: Number(tpl) }
      : { subject: str(fd.get('subject')), body: str(fd.get('body')) },
    async (m) => {
      await mailer().sendMail({ from: FROM, to: m.to, subject: m.subject, text: m.text })
    },
  )
  revalidatePath('/admin/lead')
}

export async function saveView(fd: FormData): Promise<void> {
  const { payload, user } = await session('enquiries.read')
  const name = str(fd.get('name')).trim()
  if (!name) return
  await payload.create({
    collection: 'saved-views',
    overrideAccess: true,
    data: { user: user.id, name, query: str(fd.get('query')) },
  })
  revalidatePath('/admin/leads')
}

export async function deleteView(fd: FormData): Promise<void> {
  const { payload, user } = await session('enquiries.read')
  await payload.delete({
    collection: 'saved-views',
    where: { and: [{ id: { equals: num(fd.get('id')) } }, { user: { equals: user.id } }] },
    overrideAccess: true,
  })
  revalidatePath('/admin/leads')
}

// ---------- workflow ----------
const WF = new Set<string>(WORKFLOW_COLLECTIONS)

/** Moves a document through the workflow with the caller's own permissions: the collection hooks re-check role and gates. */
export async function transitionDoc(fd: FormData): Promise<void> {
  const { payload, user } = await session('comment')
  const collection = str(fd.get('collection'))
  const id = num(fd.get('id'))
  const to = str(fd.get('to')) as Status
  const comment = str(fd.get('comment'))
  const publishAt = str(fd.get('publishAt'))
  if (!WF.has(collection)) throw new Error('Unknown collection')
  const doc = (await payload.findByID({
    collection: collection as 'pages',
    id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as {
    workflow?: { status?: Status; submittedBy?: number | { id: number } | null }
  }
  const from = doc.workflow?.status ?? 'draft'
  const chk = checkTransition(from, to, user.role)
  if (!chk.ok) throw new Error(chk.reason)
  if (to === 'draft' && from === 'in_review' && !comment.trim())
    throw new Error('Add a comment when requesting changes')
  const schedule = to === 'published' && publishAt && new Date(publishAt).getTime() > Date.now()
  await payload.update({
    collection: collection as 'pages',
    id,
    user,
    overrideAccess: false,
    data: schedule
      ? {
          workflow: {
            publishAt: new Date(publishAt).toISOString(),
            scheduledBy: user.id,
            ...(comment ? { reviewNotes: comment } : {}),
          },
        }
      : {
          workflow: { status: to, publishAt: null, ...(comment ? { reviewNotes: comment } : {}) },
        },
  })
  const link = `/admin/collections/${collection}/${String(id)}`
  if (to === 'in_review') {
    const approvers = await payload.find({
      collection: 'users',
      where: { role: { in: ['marketing_reviewer', 'publisher', 'administrator'] } },
      overrideAccess: true,
      depth: 0,
      limit: 50,
    })
    for (const a of approvers.docs)
      if (a.id !== user.id)
        await notify(
          payload,
          a.id,
          'review.requested',
          `${collection} #${String(id)} submitted for review`,
          link,
        )
  }
  if (to === 'draft' && from === 'in_review') {
    const sb = doc.workflow?.submittedBy
    const sid = typeof sb === 'object' && sb ? sb.id : sb
    if (sid)
      await notify(
        payload,
        sid,
        'review.changes',
        `Changes requested on ${collection} #${String(id)}: ${comment.slice(0, 80)}`,
        link,
      )
  }
  await writeAudit(payload, {
    actor: user.id,
    action: schedule ? 'workflow.schedule' : 'workflow.transition',
    collection,
    docId: id,
    fromStatus: from,
    toStatus: schedule ? 'scheduled' : to,
    summary: comment.slice(0, 120),
  })
  revalidatePath('/admin/workflow')
}

/** Expiring preview link for a draft page or project (7 days by default). */
export async function createPreviewLink(
  collection: string,
  id: number,
  hours = 168,
): Promise<Result> {
  try {
    const { payload, user } = await session('comment')
    if (collection !== 'pages' && collection !== 'projects')
      throw new Error('Preview is available for pages and projects')
    const token = signPreview(
      { c: collection, id, exp: Date.now() + hours * 3_600_000 },
      readSecret('PAYLOAD_SECRET'),
    )
    await writeAudit(payload, {
      actor: user.id,
      action: 'preview.link',
      collection,
      docId: id,
      summary: `expires in ${String(hours)}h`,
    })
    return ok('Link created', `${process.env.PUBLIC_URL ?? ''}/preview/${token}`)
  } catch (e) {
    return fail(e)
  }
}

// ---------- media ----------
export async function bulkAlt(fd: FormData): Promise<void> {
  const { payload, user } = await session('media.write')
  for (const [k, v] of fd.entries()) {
    if (!k.startsWith('alt_') || typeof v !== 'string' || !v.trim()) continue
    await payload.update({
      collection: 'media',
      id: Number(k.slice(4)),
      data: { alt: v.trim() },
      user,
      overrideAccess: false,
    })
  }
  await writeAudit(payload, {
    actor: user.id,
    action: 'media.bulk-alt',
    collection: 'media',
    docId: 'bulk',
  })
  revalidatePath('/admin/media-library')
}

export async function bulkMediaMeta(fd: FormData): Promise<void> {
  const { payload, user } = await session('media.write')
  const ids = fd.getAll('ids').map(Number)
  const folder = str(fd.get('folder')).trim()
  const tags = str(fd.get('tags'))
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  for (const id of ids) {
    await payload.update({
      collection: 'media',
      id,
      data: { ...(folder ? { folder } : {}), ...(tags.length ? { tags } : {}) },
      user,
      overrideAccess: false,
    })
  }
  await writeAudit(payload, {
    actor: user.id,
    action: 'media.bulk-meta',
    collection: 'media',
    docId: 'bulk',
    summary: `${String(ids.length)} files`,
  })
  revalidatePath('/admin/media-library')
}

/** Delete is blocked while any document references the file. */
export async function deleteMedia(fd: FormData): Promise<void> {
  const { payload, user } = await session('media.write')
  const id = num(fd.get('id'))
  const { usedIn } = await import('./media')
  const refs = await usedIn(payload, id)
  if (refs.length)
    throw new Error(`In use by ${String(refs.length)} document(s); remove those references first`)
  await payload.delete({ collection: 'media', id, user, overrideAccess: false })
  await writeAudit(payload, {
    actor: user.id,
    action: 'media.delete',
    collection: 'media',
    docId: id,
  })
  revalidatePath('/admin/media-library')
}

// ---------- site ----------
export async function testRedirect(path: string): Promise<Result> {
  try {
    await session('redirects.manage')
    const p = path.trim().split('?')[0] ?? ''
    const hit = (await getRedirectMap(0)).get(p)
    return ok(hit ? `${String(hit.type)} → ${hit.to}` : 'No redirect matches this path')
  } catch (e) {
    return fail(e)
  }
}

export async function redirectFrom404(fd: FormData): Promise<void> {
  const { payload, user } = await session('redirects.manage')
  const from = str(fd.get('from'))
  const to = str(fd.get('to')).trim()
  const created = await payload.create({
    collection: 'redirects',
    user,
    overrideAccess: false,
    data: { from, to, type: '301', active: true, notes: 'Created from the 404 log' },
  })
  await payload.delete({
    collection: 'not-found-log',
    where: { path: { equals: from } },
    overrideAccess: true,
  })
  invalidateRedirects()
  await writeAudit(payload, {
    actor: user.id,
    action: 'redirect.from-404',
    collection: 'redirects',
    docId: created.id,
  })
  revalidatePath('/admin/site-tools')
}

export async function sendTestEmail(): Promise<Result> {
  try {
    const { payload, user } = await session('users.manage')
    const to = (user.email as string | undefined) ?? ''
    await mailer().sendMail({
      from: FROM,
      to,
      subject: 'Introyale test email',
      html: shell('SMTP test', '<p>SMTP is working.</p>'),
    })
    await writeAudit(payload, {
      actor: user.id,
      action: 'smtp.test',
      collection: 'integrations',
      docId: 'smtp',
    })
    return ok(`Sent to ${to}`)
  } catch (e) {
    return fail(e)
  }
}

// ---------- system / security ----------
export async function retryJob(fd: FormData): Promise<void> {
  const { payload, user } = await session('system.view')
  const id = str(fd.get('id'))
  await payload.update({
    collection: 'payload-jobs',
    id,
    overrideAccess: true,
    data: {
      hasError: false,
      processing: false,
      error: null,
      waitUntil: new Date().toISOString(),
    },
  })
  await writeAudit(payload, {
    actor: user.id,
    action: 'job.retry',
    collection: 'payload-jobs',
    docId: id,
  })
  revalidatePath('/admin/system')
}

export async function revokeSession(fd: FormData): Promise<void> {
  const { payload, user } = await session('users.manage')
  const uid = num(fd.get('userId'))
  const sid = str(fd.get('sessionId'))
  const target = (await payload.findByID({
    collection: 'users',
    id: uid,
    overrideAccess: true,
    depth: 0,
  })) as unknown as { sessions?: { id: string }[] }
  await payload.update({
    collection: 'users',
    id: uid,
    overrideAccess: true,
    data: { sessions: (target.sessions ?? []).filter((s) => s.id !== sid) },
  })
  await writeAudit(payload, {
    actor: user.id,
    action: 'session.revoke',
    collection: 'users',
    docId: uid,
  })
  revalidatePath('/admin/security')
}

export async function forceMfaReset(fd: FormData): Promise<void> {
  const { payload, user } = await session('users.manage')
  const uid = num(fd.get('userId'))
  await payload.update({
    collection: 'users',
    id: uid,
    overrideAccess: true,
    data: {
      totp: {
        enabled: false,
        secret: null,
        recoveryCodes: [],
        failedAttempts: 0,
        lockedUntil: null,
      },
      sessions: [],
    },
  })
  await writeAudit(payload, {
    actor: user.id,
    action: 'mfa.reset',
    collection: 'users',
    docId: uid,
  })
  await notify(
    payload,
    uid,
    'security',
    'Your MFA was reset by an administrator. Set it up again at next sign-in.',
  )
  revalidatePath('/admin/security')
}

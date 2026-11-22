import type { Payload } from 'payload'

/** Append an audit-log row for a state change made outside collection hooks (admin v2 views, jobs). */
export async function writeAudit(
  payload: Payload,
  e: {
    actor?: number | string | null
    action: string
    collection: string
    docId: string | number
    fromStatus?: string | null
    toStatus?: string | null
    summary?: string
  },
): Promise<void> {
  await payload.create({
    collection: 'audit-log',
    overrideAccess: true,
    data: {
      actor: e.actor ? Number(e.actor) : null,
      action: e.action,
      collection: e.collection,
      docId: String(e.docId),
      fromStatus: e.fromStatus ?? null,
      toStatus: e.toStatus ?? null,
      diffSummary: e.summary ?? e.action,
      at: new Date().toISOString(),
    },
  })
}

/** In-admin bell entry for one user. */
export async function notify(
  payload: Payload,
  userId: number | string,
  kind: string,
  text: string,
  link?: string,
): Promise<void> {
  await payload.create({
    collection: 'notifications',
    overrideAccess: true,
    data: { user: Number(userId), kind, text, link: link ?? null, read: false },
  })
  const u = (await payload
    .findByID({ collection: 'users', id: Number(userId), depth: 0, overrideAccess: true })
    .catch(() => null)) as { email?: string; notifyByEmail?: boolean } | null
  if (u?.notifyByEmail && u.email) {
    const { mailer, FROM, shell } = await import('./mail')
    await mailer()
      .sendMail({
        from: FROM,
        to: u.email,
        subject: text,
        html: shell('Notification', `<p>${text}</p>`),
      })
      .catch(() => undefined)
  }
}

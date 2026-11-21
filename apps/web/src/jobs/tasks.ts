import type { Payload, TaskConfig } from 'payload'
import { ALERT_EMAIL, FROM, STAFF_INBOX, mailer, shell } from '../lib/mail'

// Lead delivery tasks (SPEC M8). Retries: 3 attempts with exponential backoff. After the final
// failure, onFail sends an alert with the reference only (no personal data) and logs the error type.

type Input = { enquiryId: number }
type Enquiry = {
  id: number
  ref: string
  type: 'consultation' | 'general'
  sector?: string | null
  location?: string | null
  budgetBand?: string | null
  email: string
  name: string
}

const RETRY = { attempts: 3, backoff: { type: 'exponential' as const, delay: 60_000 } }

async function loadEnquiry(payload: Payload, enquiryId: number): Promise<Enquiry> {
  const doc = await payload.findByID({
    collection: 'enquiries',
    id: enquiryId,
    overrideAccess: true,
    depth: 0,
  })
  return doc as unknown as Enquiry
}

async function setDelivery(
  payload: Payload,
  enquiryId: number,
  patch: Record<string, unknown>,
): Promise<void> {
  await payload.update({
    collection: 'enquiries',
    id: enquiryId,
    data: { deliveryStatus: patch },
    overrideAccess: true,
  })
}

async function alertOnFinalFailure(
  payload: Payload,
  task: string,
  enquiryId: number,
): Promise<void> {
  payload.logger.error({ msg: 'lead delivery failed after retries', task, enquiryId })
  if (!ALERT_EMAIL) return
  try {
    await mailer().sendMail({
      from: FROM,
      to: ALERT_EMAIL,
      subject: `[Introyale] Lead delivery failed: ${task}`,
      html: shell(
        'Lead delivery failed',
        `<p>Task <code>${task}</code> failed after retries for enquiry #${String(enquiryId)}. Open the CMS to review.</p>`,
      ),
    })
  } catch {
    payload.logger.error({ msg: 'alert email could not be sent', task })
  }
}

export const deliverStaffEmail: TaskConfig<'deliverStaffEmail'> = {
  slug: 'deliverStaffEmail',
  label: 'Deliver staff email',
  retries: RETRY,
  inputSchema: [{ name: 'enquiryId', type: 'number', required: true }],
  outputSchema: [{ name: 'sent', type: 'checkbox' }],
  onFail: async ({ input, req }) => {
    await alertOnFinalFailure(req.payload, 'deliverStaffEmail', (input as Input).enquiryId)
  },
  handler: async ({ input, req }) => {
    const { enquiryId } = input
    const e = await loadEnquiry(req.payload, enquiryId)
    const adminUrl = `${process.env.PUBLIC_URL ?? ''}/admin/collections/enquiries/${String(e.id)}`
    // Summary only: no name, email, phone or brief in staff mail when SMTP is not TLS (SPEC §5.2).
    const body = `<p>New ${e.type === 'consultation' ? 'consultation request' : 'enquiry'} <strong>${e.ref}</strong>.</p>
      <ul><li>Sector: ${e.sector ?? '—'}</li><li>District: ${e.location ?? '—'}</li><li>Budget band: ${e.budgetBand ?? '—'}</li></ul>
      <p><a href="${adminUrl}">Open in the CMS</a></p>`
    await mailer().sendMail({
      from: FROM,
      to: STAFF_INBOX,
      subject: `New enquiry ${e.ref}`,
      html: shell('New enquiry', body),
    })
    await setDelivery(req.payload, enquiryId, { email: 'sent', attempts: 1, lastError: null })
    return { output: { sent: true } }
  },
}

export const sendConfirmation: TaskConfig<'sendConfirmation'> = {
  slug: 'sendConfirmation',
  label: 'Send confirmation to applicant',
  retries: RETRY,
  inputSchema: [{ name: 'enquiryId', type: 'number', required: true }],
  outputSchema: [{ name: 'sent', type: 'checkbox' }],
  onFail: async ({ input, req }) => {
    await alertOnFinalFailure(req.payload, 'sendConfirmation', (input as Input).enquiryId)
  },
  handler: async ({ input, req }) => {
    const { enquiryId } = input
    const e = await loadEnquiry(req.payload, enquiryId)
    const body = `<p>Thank you for getting in touch. Your reference is <strong>${e.ref}</strong>.</p>
      <p>A member of the studio will reply using the contact method you chose.</p>`
    await mailer().sendMail({
      from: FROM,
      to: e.email,
      subject: `We received your request (${e.ref})`,
      html: shell('Thank you', body),
    })
    return { output: { sent: true } }
  },
}

/** CRM adapter. `noop` at launch (D5); FEATURE_CRM gates the job. */
export const deliverCrm: TaskConfig<'deliverCrm'> = {
  slug: 'deliverCrm',
  label: 'Deliver to CRM (noop adapter)',
  retries: RETRY,
  inputSchema: [{ name: 'enquiryId', type: 'number', required: true }],
  outputSchema: [{ name: 'delivered', type: 'checkbox' }],
  handler: async ({ input, req }) => {
    await setDelivery(req.payload, input.enquiryId, { crm: 'skipped:noop' })
    return { output: { delivered: false } }
  },
}

/** Monthly purge (D11): anonymise enquiries past retention. Scheduled by the worker. */
export const purgeEnquiries: TaskConfig<'purgeEnquiries'> = {
  slug: 'purgeEnquiries',
  label: 'Anonymise expired enquiries',
  inputSchema: [],
  outputSchema: [{ name: 'purged', type: 'number' }],
  handler: async ({ req }) => {
    const due = await req.payload.find({
      collection: 'enquiries',
      where: { retentionUntil: { less_than: new Date().toISOString() } },
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })
    for (const d of due.docs) {
      await req.payload.update({
        collection: 'enquiries',
        id: d.id,
        overrideAccess: true,
        data: {
          name: 'Anonymised',
          email: 'anonymised@invalid.test',
          phone: null,
          brief: null,
          plansLink: null,
          retentionUntil: null,
        },
      })
    }
    return { output: { purged: due.docs.length } }
  },
}

export const jobTasks = [deliverStaffEmail, sendConfirmation, deliverCrm, purgeEnquiries]

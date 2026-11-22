import { headers } from 'next/headers'
import { cms } from './cms'
import { clientIp, isBot, visitorId } from './analytics/core'
import { attributionFor, dubaiDay, saltFor, type Attribution } from './analytics/store'
import { scoreLead } from './score'
import type { ConsultationInput, ContactInput } from './validation/enquiry'

const RETENTION_MS = 24 * 30 * 24 * 60 * 60 * 1000 // 24 months (D11; [CONFIRM legal])

/** Next reference IR-YYYY-NNNN for the year. Retries on the unique index if two writes race. */
async function nextRef(year: number): Promise<string> {
  const payload = await cms()
  const count = await payload.count({
    collection: 'enquiries',
    where: { ref: { like: `IR-${String(year)}-` } },
    overrideAccess: true,
  })
  return `IR-${String(year)}-${String(count.totalDocs + 1).padStart(4, '0')}`
}

/** First and last touch for the visitor sending this request (same-day, cookieless). Null when unknown, opted out or no request. */
async function attributionOfRequest(): Promise<Attribution | null> {
  try {
    const h = await headers()
    const ua = h.get('user-agent') ?? ''
    if (isBot(ua) || h.get('dnt') === '1' || h.get('sec-gpc') === '1') return null
    const payload = await cms()
    const salt = await saltFor(payload, dubaiDay())
    return await attributionFor(payload, visitorId(salt, clientIp(h), ua))
  } catch {
    return null // outside a request (tests, scripts) or analytics unavailable: the lead is still saved
  }
}

/** Stores the lead as the system of record, then queues delivery jobs (outbox, SPEC M8). */
export async function createEnquiry(input: ConsultationInput | ContactInput): Promise<string> {
  const payload = await cms()
  const year = new Date().getFullYear()
  const attribution = await attributionOfRequest()
  const scored = scoreLead({
    type: input.type,
    ...('sector' in input
      ? {
          sector: input.sector,
          budgetBand: input.budgetBand,
          approxArea: input.approxArea,
          stage: input.stage,
          targetStart: input.targetStart,
          brief: input.brief,
          plansLink: input.plansLink,
        }
      : { brief: input.message }),
    source: attribution?.source,
    pages: attribution?.pages,
    sessions: attribution?.sessions,
  })
  let lastError: unknown
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = await nextRef(year)
    try {
      const doc = await payload.create({
        collection: 'enquiries',
        overrideAccess: true,
        data: {
          ref,
          type: input.type,
          ...('sector' in input
            ? {
                sector: input.sector,
                projectType: input.projectType,
                location: input.location,
                propertyType: input.propertyType,
                approxArea: input.approxArea,
                services: input.services,
                stage: input.stage,
                targetStart: input.targetStart,
                budgetBand: input.budgetBand,
                brief: input.brief,
                plansLink: input.plansLink,
                preferredMethod: input.preferredMethod,
                preferredTime: input.preferredTime,
              }
            : { brief: input.message }),
          name: input.name,
          email: input.email,
          phone: input.phone,
          consent: { given: true, textVersion: 'v1', at: new Date().toISOString() },
          sourcePage: input.sourcePage,
          ...(attribution
            ? {
                attribution,
                utm: {
                  source: attribution.last.source,
                  campaign: attribution.last.campaign ?? undefined,
                },
              }
            : {}),
          score: scored.score,
          scoreReasons: scored.reasons,
          retentionUntil: new Date(Date.now() + RETENTION_MS).toISOString(),
          deliveryStatus: { email: 'queued', crm: 'queued', attempts: 0 },
        },
      })
      await payload.jobs.queue({ task: 'deliverStaffEmail', input: { enquiryId: doc.id } })
      await payload.jobs.queue({ task: 'sendConfirmation', input: { enquiryId: doc.id } })
      if (process.env.FEATURE_CRM === 'true') {
        await payload.jobs.queue({ task: 'deliverCrm', input: { enquiryId: doc.id } })
      }
      return ref
    } catch (err) {
      lastError = err
      // Unique violation on ref: another request took the number. Try the next one.
    }
  }
  throw lastError instanceof Error ? lastError : new Error('could not allocate enquiry reference')
}

'use server'

import { redirect } from 'next/navigation'
import { altchaPasses, elapsedEnough, honeypotTripped } from '@/lib/bot'
import { createEnquiry } from '@/lib/enquiries'
import { altchaUnused, clientIp, hmacKey, RATE_LIMITED_MESSAGE, signingKey } from '@/lib/guard'
import { EMAIL_LIMIT, IP_LIMIT, hitRateLimit, scopeKey } from '@/lib/rateLimit'
import { consultationSchema, fieldErrors, type FieldErrors } from '@/lib/validation/enquiry'

export type ActionState =
  { ok: false; message?: string; errors?: FieldErrors } | { ok: true; ref: string } | null

const GENERIC = 'We could not send your request. Please check the form and try again.'

/** Consultation submission. Every step is server-side: honeypot, signed timing, proof-of-work, rate limits, schema. */
export async function submitConsultation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Honeypot and timing failures get the same generic reply as a validation failure (no oracle for bots).
  if (honeypotTripped(formData.get('website'))) return { ok: false, message: GENERIC }
  if (!elapsedEnough(formData.get('startedAt'), signingKey()))
    return { ok: false, message: 'Please take a moment and try again.' }
  if (
    !(await altchaPasses(formData.get('altcha'), hmacKey())) ||
    !(await altchaUnused(formData.get('altcha')))
  )
    return { ok: false, message: 'Verification failed. Please try again.' }

  const ip = await clientIp()
  const byIp = await hitRateLimit(scopeKey('ip', ip), IP_LIMIT.windowMs, IP_LIMIT.max)
  if (!byIp.allowed) return { ok: false, message: RATE_LIMITED_MESSAGE }

  const parsed = consultationSchema.safeParse({
    type: 'consultation',
    sector: formData.get('sector'),
    projectType: formData.get('projectType') ?? '',
    location: formData.get('location') ?? '',
    propertyType: formData.get('propertyType') ?? '',
    approxArea: formData.get('approxArea') ?? '',
    services: formData.getAll('services').map(String),
    stage: formData.get('stage'),
    targetStart: formData.get('targetStart') ?? '',
    budgetBand: formData.get('budgetBand') ?? '',
    brief: formData.get('brief') ?? '',
    plansLink: formData.get('plansLink') ?? '',
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    preferredMethod: formData.get('preferredMethod'),
    preferredTime: formData.get('preferredTime') ?? '',
    consent: formData.get('consent') === 'on' ? true : undefined,
    sourcePage: formData.get('sourcePage') ?? '/start',
  })
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }

  const byEmail = await hitRateLimit(
    scopeKey('email', parsed.data.email),
    EMAIL_LIMIT.windowMs,
    EMAIL_LIMIT.max,
  )
  if (!byEmail.allowed) return { ok: false, message: RATE_LIMITED_MESSAGE }

  const ref = await createEnquiry(parsed.data)
  redirect(`/start/thank-you?ref=${encodeURIComponent(ref)}`)
}

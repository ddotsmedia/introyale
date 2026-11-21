'use server'

import { redirect } from 'next/navigation'
import { altchaPasses, elapsedEnough, honeypotTripped } from '@/lib/bot'
import { createEnquiry } from '@/lib/enquiries'
import { altchaUnused, clientIp, hmacKey, RATE_LIMITED_MESSAGE, signingKey } from '@/lib/guard'
import { EMAIL_LIMIT, IP_LIMIT, hitRateLimit, scopeKey } from '@/lib/rateLimit'
import { contactSchema, fieldErrors, type FieldErrors } from '@/lib/validation/enquiry'

export type ContactState =
  { ok: false; message?: string; errors?: FieldErrors } | { ok: true; ref: string } | null

const GENERIC = 'We could not send your message. Please check the form and try again.'

/** General contact form. Same guard chain as the consultation flow. */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
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

  const parsed = contactSchema.safeParse({
    type: 'general',
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    message: formData.get('message') ?? '',
    consent: formData.get('consent') === 'on' ? true : undefined,
    sourcePage: formData.get('sourcePage') ?? '/contact',
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

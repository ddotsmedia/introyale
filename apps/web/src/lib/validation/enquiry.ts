import { z } from 'zod'
import { sanitizeText } from '../sanitize'

// Lead schemas (SPEC brief §10, M8). Server-side validation is authoritative; the client mirrors these.

const SECTORS = ['residential', 'commercial', 'hospitality-leisure'] as const
const STAGES = ['concept', 'design', 'delivery', 'refurbishment', 'not-sure'] as const
const METHODS = ['email', 'phone', 'whatsapp'] as const

/** Text fields are sanitised (tags and control characters removed) before length checks. */
const text = (max: number) =>
  z
    .string()
    .transform((v) => sanitizeText(v))
    .pipe(z.string().max(max))
const required = (max: number) => text(max).pipe(z.string().min(1, 'Required'))

export const consultationSchema = z.object({
  type: z.literal('consultation'),
  sector: z.enum(SECTORS),
  projectType: text(80),
  location: text(120),
  propertyType: text(80),
  approxArea: text(40),
  services: z.array(text(80)).max(10).default([]),
  stage: z.enum(STAGES),
  targetStart: text(40),
  budgetBand: text(80),
  brief: required(2000),
  plansLink: z
    .string()
    .max(500)
    .refine((v) => v === '' || /^https:\/\//.test(v), 'Use a secure link (https://)')
    .default(''),
  name: required(80),
  email: z.string().trim().max(200).pipe(z.email('Enter a valid email')),
  phone: text(30),
  preferredMethod: z.enum(METHODS),
  preferredTime: text(60),
  consent: z.literal(true, { message: 'Consent is required' }),
  sourcePage: text(200),
})
export type ConsultationInput = z.infer<typeof consultationSchema>

export const contactSchema = z.object({
  type: z.literal('general'),
  name: required(80),
  email: z.string().trim().max(200).pipe(z.email('Enter a valid email')),
  phone: text(30),
  message: required(2000),
  consent: z.literal(true, { message: 'Consent is required' }),
  sourcePage: text(200),
})
export type ContactInput = z.infer<typeof contactSchema>

export type FieldErrors = Record<string, string>

/** Flattens Zod issues into field → message for the form. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    out[key] ??= issue.message
  }
  return out
}

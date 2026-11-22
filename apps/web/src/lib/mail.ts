import { createTransport, type Transporter } from 'nodemailer'
import { readSecret } from './secrets'

// SMTP via env (D4). TLS is required in production; Mailpit is plain in development.
let transport: Transporter | undefined

/** FEATURE_EMAIL=false: leads are stored, nothing is sent (no SMTP configured yet). */
export const EMAIL_ENABLED = process.env.FEATURE_EMAIL !== 'false'

export function mailer(): Transporter {
  transport ??= createTransport(
    EMAIL_ENABLED
      ? {
          host: process.env.SMTP_HOST ?? 'localhost',
          port: Number(process.env.SMTP_PORT ?? 1025),
          secure: Number(process.env.SMTP_PORT ?? 1025) === 465,
          // TLS is required in production (SPEC §5.2). Local Mailpit sets SMTP_REQUIRE_TLS=false.
          requireTLS: process.env.SMTP_REQUIRE_TLS
            ? process.env.SMTP_REQUIRE_TLS === 'true'
            : process.env.NODE_ENV === 'production',
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: readSecret('SMTP_PASSWORD') }
            : undefined,
        }
      : { jsonTransport: true },
  )
  return transport
}

export const FROM = process.env.MAIL_FROM ?? 'no-reply@introyale.com'
export const STAFF_INBOX = process.env.STAFF_EMAIL ?? 'info@introyale.com'
export const ALERT_EMAIL = process.env.ALERT_EMAIL ?? ''

/** Branded wrapper for transactional HTML. Plain inline styles, no remote assets. */
export function shell(title: string, body: string): string {
  return `<!doctype html><html lang="en"><body style="margin:0;background:#FBF9F6;color:#1F1D1A;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px"><p style="font-family:Georgia,serif;font-size:20px;margin:0 0 16px">Introyale Interiors</p>
<h1 style="font-family:Georgia,serif;font-size:24px;font-weight:600;margin:0 0 16px">${title}</h1>${body}</div></body></html>`
}

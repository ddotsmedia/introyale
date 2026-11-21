import { randomUUID } from 'node:crypto'
import pino from 'pino'

// Structured JSON logs (SPEC §2.9). Personal fields are redacted at source; enquiry values never reach a log line.
export const REDACT_PATHS = [
  'password',
  'token',
  'secret',
  '*.password',
  '*.token',
  '*.secret',
  'email',
  '*.email',
  'phone',
  '*.phone',
  'name',
  '*.name',
  'brief',
  '*.brief',
  'authorization',
  'cookie',
  'headers.cookie',
  'headers.authorization',
]

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'introyale-web' },
  redact: { paths: REDACT_PATHS, censor: '[redacted]' },
  timestamp: pino.stdTimeFunctions.isoTime,
})

/** Request id for correlation across logs (returned as X-Request-Id). */
export function requestId(incoming: string | null | undefined): string {
  return incoming && /^[\w-]{8,64}$/.test(incoming) ? incoming : randomUUID()
}

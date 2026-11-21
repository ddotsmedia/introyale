import * as Sentry from '@sentry/nextjs'
import { readSecret } from './lib/secrets'
import { scrubEvent } from './lib/sentryScrub'
import { assertEnvPolicy } from './lib/envPolicy'

// Server error tracking to GlitchTip through the Sentry SDK (SPEC §2.9, M10).
// The DSN is a Docker secret, never a NEXT_PUBLIC value. Client-side reporting stays off at launch
// because a DSN would have to ship in the browser bundle.
export function register(): void {
  assertEnvPolicy()
  const dsn = readSecret('SENTRY_DSN')
  if (!dsn) return
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    beforeSend: (event) => scrubEvent(event),
  })
}

export const onRequestError = Sentry.captureRequestError

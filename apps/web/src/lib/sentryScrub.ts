// Strips personal data from error events before they leave the server (SPEC §2.9, M10).
type Event = {
  request?: {
    data?: unknown
    cookies?: unknown
    headers?: Record<string, string>
    query_string?: unknown
  }
  user?: unknown
  breadcrumbs?: { data?: unknown; message?: string }[]
  extra?: Record<string, unknown>
  contexts?: Record<string, unknown>
}

const SENSITIVE_HEADERS = new Set(['cookie', 'authorization', 'x-forwarded-for', 'x-real-ip'])

export function scrubEvent<T extends Event>(event: T): T {
  if (event.request) {
    event.request.data = undefined
    event.request.cookies = undefined
    event.request.query_string = undefined
    if (event.request.headers) {
      event.request.headers = Object.fromEntries(
        Object.entries(event.request.headers).filter(
          ([k]) => !SENSITIVE_HEADERS.has(k.toLowerCase()),
        ),
      )
    }
  }
  event.user = undefined
  if (event.breadcrumbs) {
    for (const b of event.breadcrumbs) b.data = undefined
  }
  event.extra = undefined
  return event
}

import { NextResponse, type NextRequest } from 'next/server'
import { buildCsp, newNonce, staticSecurityHeaders } from './lib/csp'
import { getRedirectMap } from './lib/redirects'

/**
 * Request-level policy (Next 16 `proxy` convention, Node runtime):
 *  - a per-request CSP nonce, passed to Next so its scripts carry it (SPEC §2.7)
 *  - security headers on every response (HSTS in production)
 *  - legacy and CMS redirects (301/302) and gone pages (410), SPEC §4 and §5.2
 *  - X-Robots-Tag noindex when ROBOTS_NOINDEX=true (staging, SPEC §2.3)
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const production = process.env.NODE_ENV === 'production'
  const nonce = newNonce()
  const framed = request.nextUrl.pathname.startsWith('/preview/')
  const csp = buildCsp(nonce, {
    dev: !production,
    umamiOrigin: process.env.UMAMI_ORIGIN ?? null,
    frameSelf: framed,
  })

  // Next reads the nonce from the request's CSP header and applies it to its own inline scripts.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', csp)
  requestHeaders.set('x-pathname', request.nextUrl.pathname) // read by the 404 page for the 404 log

  const hit = (await getRedirectMap()).get(request.nextUrl.pathname)
  let response: NextResponse
  if (hit?.type === 410) {
    response = new NextResponse('Gone', { status: 410, headers: { 'content-type': 'text/plain' } })
  } else if (hit) {
    // The rule's target may carry a query or hash (e.g. /work?sector=commercial, /studio#clients).
    response = NextResponse.redirect(new URL(hit.to, request.url), hit.type)
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  response.headers.set('Content-Security-Policy', csp)
  for (const [name, value] of Object.entries(staticSecurityHeaders(production))) {
    response.headers.set(name, value)
  }
  if (framed) response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  if (process.env.ROBOTS_NOINDEX === 'true') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

export const config = {
  // Admin is covered too: the nonce CSP applies to Payload pages. API routes return data, not documents.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}

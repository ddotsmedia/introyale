import { NextResponse, type NextRequest } from 'next/server'
import { getRedirectMap } from './lib/redirects'

/**
 * Request-level policy (Next 16 `proxy` convention, Node runtime):
 *  - legacy and CMS redirects (301/302) and gone pages (410), SPEC §4 and §5.2
 *  - X-Robots-Tag noindex on every response when ROBOTS_NOINDEX=true (staging, SPEC §2.3)
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const hit = (await getRedirectMap()).get(request.nextUrl.pathname)

  let response: NextResponse
  if (hit?.type === 410) {
    response = new NextResponse('Gone', { status: 410, headers: { 'content-type': 'text/plain' } })
  } else if (hit) {
    // The rule's target may carry a query or hash (e.g. /work?sector=commercial, /studio#clients).
    response = NextResponse.redirect(new URL(hit.to, request.url), hit.type)
  } else {
    response = NextResponse.next()
  }

  if (process.env.ROBOTS_NOINDEX === 'true') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|admin).*)'],
}

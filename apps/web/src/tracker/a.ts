// First-party analytics tracker (cookieless). Built to public/a.js by `pnpm build:tracker`; budget: 2 KB gzip.
const d = document
const n = navigator as Navigator & { globalPrivacyControl?: boolean }
if (n.doNotTrack !== '1' && !n.globalPrivacyControl && !n.webdriver) {
  const send = (o: Record<string, unknown>) => {
    const b = JSON.stringify({ ...o, p: location.pathname, l: n.language, sw: innerWidth })
    if (!n.sendBeacon('/api/a/collect', new Blob([b], { type: 'text/plain' }))) {
      void fetch('/api/a/collect', { method: 'POST', body: b, keepalive: true })
    }
  }
  const ev = (name: string, v?: number) => {
    send({ t: 'ev', n: name, v })
  }
  const q = new URLSearchParams(location.search)
  send({
    t: 'pv',
    ti: d.title,
    r: d.referrer,
    us: q.get('utm_source') ?? undefined,
    um: q.get('utm_medium') ?? undefined,
    uc: q.get('utm_campaign') ?? undefined,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    nf: !!d.querySelector('meta[name="ir:status"][content="404"]'),
  })
  // Delegated clicks: links by type, plus any element tagged data-track="name".
  d.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element).closest<HTMLElement>('a,[data-track]')
      if (!el) return
      const t = el.dataset['track']
      if (t) {
        ev(t)
        return
      }
      const h = (el as Partial<HTMLAnchorElement>).href ?? ''
      if (/^tel:/i.test(h)) ev('phone_click')
      else if (/^mailto:/i.test(h)) ev('email_click')
      else if (/wa\.me|whatsapp/i.test(h)) ev('whatsapp_click')
      else if (/\.(pdf|zip|docx?|xlsx?|pptx?)($|\?)/i.test(h)) ev('download')
      else if (h.startsWith('http') && new URL(h).host !== location.host) ev('outbound')
    },
    { capture: true, passive: true },
  )
  // Scroll depth, once per threshold.
  const hit = new Set<number>()
  addEventListener(
    'scroll',
    () => {
      const p = ((scrollY + innerHeight) / d.documentElement.scrollHeight) * 100
      for (const m of [25, 50, 75, 100]) {
        if (p >= m - 1 && !hit.has(m)) {
          hit.add(m)
          ev('scroll', m)
        }
      }
    },
    { passive: true },
  )
  // Visible time, sent when the page is hidden.
  let t0 = Date.now()
  d.addEventListener('visibilitychange', () => {
    if (d.hidden) ev('time', Math.round((Date.now() - t0) / 1000))
    else t0 = Date.now()
  })
  // Events raised by components: document.dispatchEvent(new CustomEvent('ir:track', { detail: { n, v } })).
  d.addEventListener('ir:track', (e) => {
    const x = (e as CustomEvent<{ n: string; v?: number }>).detail
    ev(x.n, x.v)
  })
}

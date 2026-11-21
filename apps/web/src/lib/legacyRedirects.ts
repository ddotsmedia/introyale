export type RedirectRule = { to: string; type: 301 | 302 | 410 }

/**
 * Legacy map from SPEC §4 and the M0 crawl (docs/redirects.csv). Used as the baseline so the
 * mapping works even before the CMS redirects collection is populated.
 */
export const LEGACY_REDIRECTS: Record<string, RedirectRule> = {
  '/index.php': { to: '/', type: 301 },
  '/aboutus.php': { to: '/studio', type: 301 },
  '/ourclients.php': { to: '/studio#clients', type: 301 },
  '/contactus.php': { to: '/contact', type: 301 },
  '/hospitality-leisure.php': { to: '/hospitality-leisure', type: 301 },
  '/hospitality-portfolio.php': { to: '/work?sector=hospitality-leisure', type: 301 },
  '/commercial.php': { to: '/commercial', type: 301 },
  '/commercial-portfolio.php': { to: '/work?sector=commercial', type: 301 },
  '/residential.php': { to: '/residential', type: 301 },
  '/residencial.php': { to: '/residential', type: 301 },
  '/residential-portfolio.php': { to: '/work?sector=residential', type: 301 },
}

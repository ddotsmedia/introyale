import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { redirectFrom404 } from '../actions'
import { RedirectTester, SmtpTest } from '../components/SiteTools'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, Card, fmtDate } from '../ui'
import { can } from '../../lib/roles'
import { readSecret } from '../../lib/secrets'

type Log = { id: number; path: string; count: number; lastSeenAt?: string }

export async function SiteTools(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell
      view={props}
      action="redirects.manage"
      title={tr(lang, 'siteTools')}
      sub="Redirects, missing pages, integrations and the site banner."
    >
      {async ({ payload, user, req }) => {
        const [logs, redirects, integ, site] = await Promise.all([
          payload.find({
            collection: 'not-found-log',
            req,
            overrideAccess: false,
            depth: 0,
            limit: 25,
            sort: '-count',
          }),
          payload.count({ collection: 'redirects', overrideAccess: true }),
          can(user.role, 'users.manage')
            ? (payload.findGlobal({
                slug: 'integrations',
                depth: 0,
                overrideAccess: true,
              }) as unknown as Promise<{
                featureFlags?: Record<string, boolean>
                secretNames?: { name: string }[]
              }>)
            : Promise.resolve(null),
          payload.findGlobal({
            slug: 'site-settings',
            depth: 0,
            overrideAccess: true,
          }) as unknown as Promise<{ banner?: { enabled?: boolean; tone?: string } }>,
        ])
        // Status only: whether something is configured, never its value.
        const set = (v: unknown) => (
          <Badge tone={v ? 'ok' : 'warn'}>{v ? 'configured' : 'not configured'}</Badge>
        )
        const rows: [string, unknown][] = [
          ['SMTP', process.env.SMTP_HOST],
          ['CRM adapter', integ?.featureFlags?.crm],
          ['Umami analytics', process.env.UMAMI_URL],
          ['Sentry / GlitchTip', readSecret('SENTRY_DSN')],
          ['Backup target', process.env.RESTIC_REPOSITORY ?? process.env.BACKUP_STATUS_FILE],
        ]
        return (
          <>
            <div className="ir-cols">
              <Card title="Site banner">
                <p>
                  Banner is{' '}
                  <Badge tone={site.banner?.enabled ? 'warn' : 'ok'}>
                    {site.banner?.enabled ? `on (${String(site.banner.tone)})` : 'off'}
                  </Badge>
                </p>
                <Link className="ir-btn" href="/admin/globals/site-settings#field-banner">
                  Edit banner
                </Link>
              </Card>
              <Card title="Redirects">
                <p>{redirects.totalDocs} redirect(s).</p>
                <RedirectTester />
                <Link className="ir-btn ghost" href="/admin/collections/redirects">
                  Manage redirects
                </Link>
              </Card>
            </div>
            <Card title="404 log: most requested missing paths">
              {logs.docs.length === 0 ? (
                <p className="ir-muted">No missing paths recorded.</p>
              ) : (
                <table className="ir-table">
                  <caption className="ir-sr">Missing paths</caption>
                  <thead>
                    <tr>
                      <th scope="col">Path</th>
                      <th scope="col">Hits</th>
                      <th scope="col">Last seen</th>
                      <th scope="col">Create redirect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(logs.docs as unknown as Log[]).map((l) => (
                      <tr key={l.id}>
                        <td>{l.path}</td>
                        <td>{l.count}</td>
                        <td>{fmtDate(l.lastSeenAt)}</td>
                        <td>
                          <form
                            action={redirectFrom404}
                            className="ir-filters"
                            style={{ margin: 0 }}
                          >
                            <input type="hidden" name="from" value={l.path} />
                            <label>
                              <span className="ir-sr">Redirect target for {l.path}</span>
                              <input type="text" name="to" placeholder="/work" required />
                            </label>
                            <button className="ir-btn ghost" type="submit">
                              Create
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
            {integ && (
              <Card title="Integrations">
                <table className="ir-table">
                  <caption className="ir-sr">Integration status</caption>
                  <tbody>
                    {rows.map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td>{set(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="ir-muted">
                  Secret names in use:{' '}
                  {(integ.secretNames ?? []).map((s) => s.name).join(', ') || 'none listed'}. Values
                  are never shown.
                </p>
                <SmtpTest />
              </Card>
            )}
          </>
        )
      }}
    </Shell>
  )
}

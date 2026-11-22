import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { contentHealth } from '../health'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, Card, Kpi } from '../ui'

export async function ContentHealth(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell
      view={props}
      action="content.health"
      title={tr(lang, 'contentHealth')}
      sub="Missing alt text, SEO, placeholders, low-resolution heroes, broken links and empty sections. Each row links to the thing to fix."
    >
      {async ({ payload }) => {
        const h = await contentHealth(payload)
        const flagged = h.docs.filter((d) => d.issues.length > 0).sort((a, b) => a.score - b.score)
        const total =
          flagged.reduce((n, d) => n + d.issues.length, 0) + h.media.length + h.facts.length
        return (
          <>
            <div className="ir-grid">
              <Kpi label="Overall score" value={`${String(h.overall)}/100`} />
              <Kpi label="Open issues" value={total} />
              <Kpi label="Images without alt text" value={h.media.length} />
              <Kpi label="Unverified facts" value={h.facts.length} />
            </div>
            <Card title="Documents">
              {flagged.length === 0 ? (
                <p>No document issues.</p>
              ) : (
                <table className="ir-table">
                  <caption className="ir-sr">Documents with issues</caption>
                  <thead>
                    <tr>
                      <th scope="col">Document</th>
                      <th scope="col">Score</th>
                      <th scope="col">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flagged.map((d) => (
                      <tr key={`${d.collection}-${d.id}`}>
                        <td>
                          {d.label}
                          <br />
                          <span className="ir-muted">{d.collection}</span>
                        </td>
                        <td style={{ minWidth: 120 }}>
                          <div
                            className="ir-score"
                            role="img"
                            aria-label={`Score ${String(d.score)} of 100`}
                          >
                            <i style={{ width: `${String(d.score)}%` }} />
                          </div>
                          {d.score}
                        </td>
                        <td>
                          <ul className="ir-list">
                            {d.issues.map((i, n) => (
                              <li key={n}>
                                <Link href={i.href}>{i.message}</Link>
                                <Badge>{i.kind}</Badge>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
            <div className="ir-cols">
              <Card title="Images without alt text">
                <ul className="ir-list">
                  {h.media.slice(0, 30).map((i, n) => (
                    <li key={n}>
                      <Link href={i.href}>{i.message}</Link>
                    </li>
                  ))}
                  {h.media.length === 0 && <li>All images have alt text.</li>}
                </ul>
              </Card>
              <Card title="Unverified facts">
                <ul className="ir-list">
                  {h.facts.map((i, n) => (
                    <li key={n}>
                      <Link href={i.href}>{i.message}</Link>
                    </li>
                  ))}
                  {h.facts.length === 0 && <li>All facts are verified.</li>}
                </ul>
              </Card>
            </div>
          </>
        )
      }}
    </Shell>
  )
}

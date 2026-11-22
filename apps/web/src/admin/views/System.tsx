import type { AdminViewServerProps } from 'payload'
import { retryJob } from '../actions'
import {
  appVersion,
  backupInfo,
  dbSize,
  errorCount,
  fmtBytes,
  health,
  jobStats,
  mediaUsage,
} from '../system'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, Card, fmtDate, Kpi, relTime } from '../ui'

type Job = {
  id: number | string
  taskSlug?: string
  createdAt: string
  error?: { message?: string } | null
}

export async function System(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell view={props} action="system.view" title={tr(lang, 'system')} sub="Administrators only.">
      {async ({ payload }) => {
        const [hl, bk, jobs, size, media, errors, integ, failed] = await Promise.all([
          health(payload),
          backupInfo(),
          jobStats(payload),
          dbSize(payload),
          mediaUsage(),
          errorCount(),
          payload.findGlobal({
            slug: 'integrations',
            depth: 0,
            overrideAccess: true,
          }) as unknown as Promise<{ lastRestoreDrill?: string }>,
          payload.find({
            collection: 'payload-jobs',
            where: { hasError: { equals: true } },
            limit: 10,
            depth: 0,
            overrideAccess: true,
            sort: '-createdAt',
          }),
        ])
        return (
          <>
            <div className="ir-grid">
              <Kpi label="Database" value={hl.db ? 'OK' : 'Down'} />
              <Kpi label="Worker" value={hl.worker ? 'OK' : 'Down'} />
              <Kpi label="App version / image" value={appVersion()} />
              <Kpi
                label="Email"
                value={process.env.FEATURE_EMAIL === 'false' ? 'Not configured' : 'On'}
                note={
                  process.env.FEATURE_EMAIL === 'false'
                    ? 'Email not configured: leads are stored, email jobs are paused'
                    : undefined
                }
              />
              <Kpi label="Database size" value={fmtBytes(size)} />
              <Kpi label="Media disk usage" value={fmtBytes(media)} />
              <Kpi
                label="Last backup"
                value={bk.at ? relTime(bk.at) : 'unknown'}
                note={bk.at ? fmtDate(bk.at) : 'No backup status file mounted'}
              />
              <Kpi
                label="Last restore drill"
                value={integ.lastRestoreDrill ? fmtDate(integ.lastRestoreDrill) : 'not recorded'}
                note="Set in Integrations"
              />
              <Kpi
                label="Jobs pending / failed"
                value={`${String(jobs.pending)} / ${String(jobs.failed)}`}
              />
              <Kpi
                label="Recent errors"
                value={errors ?? 'n/a'}
                note={errors == null ? 'GlitchTip API not configured' : 'unresolved issues'}
              />
            </div>
            <Card title="Failed jobs">
              {failed.docs.length === 0 ? (
                <p className="ir-muted">No failed jobs.</p>
              ) : (
                <table className="ir-table">
                  <caption className="ir-sr">Failed jobs</caption>
                  <thead>
                    <tr>
                      <th scope="col">Task</th>
                      <th scope="col">Created</th>
                      <th scope="col">Error</th>
                      <th scope="col">
                        <span className="ir-sr">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(failed.docs as unknown as Job[]).map((j) => (
                      <tr key={j.id}>
                        <td>
                          <Badge tone="bad">{j.taskSlug ?? 'job'}</Badge>
                        </td>
                        <td>{fmtDate(j.createdAt)}</td>
                        <td>{(j.error?.message ?? 'failed').slice(0, 120)}</td>
                        <td>
                          <form action={retryJob}>
                            <input type="hidden" name="id" value={String(j.id)} />
                            <button className="ir-btn ghost" type="submit">
                              Retry
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )
      }}
    </Shell>
  )
}

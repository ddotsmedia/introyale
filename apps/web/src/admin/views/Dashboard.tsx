import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { resetDashboardLayout, saveDashboardLayout } from '../actions'
import { LayoutEditor } from '../components/LayoutEditor'
import { dashboardData } from '../data'
import { execStats, trafficStats } from '../dashStats'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { backupInfo, dbSize, diskInfo, health, mediaUsage, appVersion } from '../system'
import { WIDGETS, resolveLayout, type Ctx, type D } from '../widgets'
import { myTasksDue } from '../../lib/crmPlus'
import { can } from '../../lib/roles'

export async function Dashboard(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell bare view={props} title={tr(lang, 'dashboard')} sub={tr(lang, 'dashboardSub')}>
      {async ({ payload, user, req }) => {
        const saved = (user as unknown as { dashboardLayout?: unknown }).dashboardLayout
        const layout = resolveLayout(saved, user.role)
        const visible = layout.order.filter((id) => !layout.hidden.includes(id))
        const wants = (...ids: string[]) => ids.some((id) => visible.includes(id))
        const leadsAllowed = can(user.role, 'enquiries.read')
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        // Only the data the visible widgets need is loaded.
        const [d, ex, traffic, tasks, hl, bk, disk, dbBytes, mediaBytes] = await Promise.all([
          dashboardData(payload, user, req) as unknown as Promise<D>,
          leadsAllowed && wants('exec', 'sectors', 'sources', 'leaderboard')
            ? execStats(payload, user, req)
            : null,
          can(user.role, 'analytics.view') && wants('traffic', 'trend', 'heatmap', 'kpi')
            ? trafficStats(payload)
            : null,
          leadsAllowed && wants('tasks') ? myTasksDue(payload, user.id, endOfDay) : [],
          wants('health') ? health(payload) : null,
          wants('health') ? backupInfo() : null,
          wants('health') ? diskInfo() : null,
          wants('health') ? dbSize(payload) : null,
          wants('health') ? mediaUsage() : null,
        ])
        const ctx: Ctx = {
          lang,
          role: user.role,
          d,
          ex,
          traffic,
          tasks,
          health: hl,
          backup: bk,
          disk,
          dbBytes,
          mediaBytes,
          version: appVersion(),
        }
        const byId = new Map(WIDGETS.map((w) => [w.id, w]))
        const items = [
          ...layout.order,
          ...WIDGETS.filter((w) => w.show(user.role) && !layout.order.includes(w.id)).map(
            (w) => w.id,
          ),
        ].flatMap((id) => {
          const w = byId.get(id)
          return w ? [{ id, title: w.title, visible: !layout.hidden.includes(id) }] : []
        })
        // Full-width widgets stand alone; half-width ones are paired in a two-column grid.
        const rows: ({ full: true; id: string } | { full: false; ids: string[] })[] = []
        for (const id of visible) {
          const w = byId.get(id)
          if (!w) continue
          const last = rows[rows.length - 1]
          if (w.size === 'full') rows.push({ full: true, id })
          else if (last && !last.full) last.ids.push(id)
          else rows.push({ full: false, ids: [id] })
        }
        return (
          <>
            <div className="ir-actions">
              {can(user.role, 'project.write') && (
                <Link className="ir-btn" href="/admin/collections/projects/create">
                  {tr(lang, 'newProject')}
                </Link>
              )}
              {can(user.role, 'content.write') && (
                <Link className="ir-btn" href="/admin/collections/journal-posts/create">
                  {tr(lang, 'newPost')}
                </Link>
              )}
              {can(user.role, 'media.write') && (
                <Link className="ir-btn ghost" href="/admin/collections/media/create">
                  {tr(lang, 'uploadMedia')}
                </Link>
              )}
              {leadsAllowed && (
                <Link className="ir-btn ghost" href="/admin/leads-board">
                  {tr(lang, 'openBoard')}
                </Link>
              )}
              {can(user.role, 'analytics.view') && (
                <Link className="ir-btn ghost" href="/admin/analytics">
                  Analytics
                </Link>
              )}
              <a className="ir-btn ghost" href="/" target="_blank" rel="noreferrer">
                {tr(lang, 'viewSite')}
                <span className="ir-sr"> (opens in a new tab)</span>
              </a>
            </div>
            <p className="ir-muted ir-noprint">
              Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>⌘</kbd> + <kbd>K</kbd>) to search leads,
              projects and pages.
            </p>
            {rows.map((row, i) =>
              row.full ? (
                <div key={row.id}>{byId.get(row.id)?.render(ctx)}</div>
              ) : (
                <div key={i} className="ir-cols">
                  {row.ids.map((id) => (
                    <div key={id}>{byId.get(id)?.render(ctx)}</div>
                  ))}
                </div>
              ),
            )}
            <LayoutEditor items={items} save={saveDashboardLayout} reset={resetDashboardLayout} />
          </>
        )
      }}
    </Shell>
  )
}

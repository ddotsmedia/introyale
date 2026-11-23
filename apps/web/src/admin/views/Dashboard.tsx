import type { AdminViewServerProps } from 'payload'
import { resetDashboardLayout, saveDashboardLayout } from '../actions'
import { Welcome } from '../components/Welcome'
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
    <Shell bare noHeading view={props} title={tr(lang, 'dashboard')} sub={tr(lang, 'dashboardSub')}>
      {async ({ payload, user, req, sp }) => {
        const rangeDays = [7, 30, 90].includes(Number(sp['range'])) ? Number(sp['range']) : 30
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
          leadsAllowed && wants('kpi', 'goal', 'sectors', 'sources', 'leaderboard')
            ? execStats(payload, user, req)
            : null,
          can(user.role, 'analytics.view') && wants('trend', 'heatmap', 'kpi', 'pages', 'health')
            ? trafficStats(payload, rangeDays)
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
          rangeDays,
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
        return (
          <>
            <Welcome
              name={user.name}
              range={rangeDays}
              summary={[
                leadsAllowed &&
                  `${String(d.d1.cur)} new enquir${d.d1.cur === 1 ? 'y' : 'ies'} today`,
                leadsAllowed &&
                  `${String(d.due.length)} follow-up${d.due.length === 1 ? '' : 's'} due`,
                d.awaiting > 0 &&
                  `${String(d.awaiting)} item${d.awaiting === 1 ? '' : 's'} awaiting review`,
              ].filter((x): x is string => !!x)}
              showRange={can(user.role, 'analytics.view')}
            />
            <div className="ir-grid12">
              {visible.map((id) => {
                const w = byId.get(id)
                return w ? (
                  <div key={id} className={`ir-span-${String(w.span)}`}>
                    {w.render(ctx)}
                  </div>
                ) : null
              })}
            </div>
            <LayoutEditor
              key={items.map((i) => `${i.id}:${String(i.visible)}`).join('|')}
              items={items}
              save={saveDashboardLayout}
              reset={resetDashboardLayout}
            />
          </>
        )
      }}
    </Shell>
  )
}

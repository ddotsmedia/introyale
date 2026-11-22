import type { AdminViewServerProps } from 'payload'
import { Kanban, type Card } from '../components/Kanban'
import { Shell } from '../Shell'
import { tr } from '../labels'

export async function LeadsBoard(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell
      view={props}
      action="enquiries.read"
      title={tr(lang, 'leadsBoard')}
      sub="Drag a card, or use its Move select. Every move is logged on the lead and in the audit log."
    >
      {async ({ payload, user }) => {
        const res = await payload.find({
          collection: 'enquiries',
          user,
          overrideAccess: false,
          depth: 0,
          limit: 300,
          sort: '-createdAt',
        })
        const cards: Card[] = (res.docs as unknown as Record<string, unknown>[]).map((e) => ({
          id: e.id as number,
          ref: String(e.ref),
          name: String(e.name ?? ''),
          sector: String(e.sector ?? ''),
          priority: String(e.priority ?? 'normal'),
          value: (e.estimatedValue as number | null) ?? null,
          due: e.followUpAt ? new Date(e.followUpAt as string).toISOString().slice(0, 10) : null,
          status: String(e.status ?? 'new'),
        }))
        return <Kanban initial={cards} />
      }}
    </Shell>
  )
}

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'
import { can, type Action, type Role } from '../lib/roles'

export type SP = Record<string, string | string[] | undefined>
type Props = {
  view: AdminViewServerProps
  action?: Action
  title: string
  /** The dashboard is already wrapped in the default template by Payload; custom routes are not. */
  bare?: boolean
  sub?: string
  children: (ctx: {
    payload: AdminViewServerProps['initPageResult']['req']['payload']
    user: { id: number; role: Role; name: string }
    req: AdminViewServerProps['initPageResult']['req']
    sp: SP
  }) => Promise<ReactNode> | ReactNode
}

/** Admin page frame. The role check runs on the server before any data is queried (SPEC §5.4). */
export async function Shell({ view, action, title, sub, children, bare }: Props) {
  const r = view.initPageResult
  const sp = (view as unknown as { searchParams?: SP }).searchParams ?? {}
  const user = r.req.user as unknown as { id: number; role: Role; name: string }
  const allowed = !action || can(user.role, action)
  const body = (
    <Gutter>
      <div className="ir">
        <h1>{title}</h1>
        {sub ? <p className="sub">{sub}</p> : null}
        {allowed ? (
          await children({ payload: r.req.payload, user, req: r.req, sp })
        ) : (
          <div className="ir-card" role="alert">
            Your role does not have access to this view.
          </div>
        )}
      </div>
    </Gutter>
  )
  if (bare) return body
  return (
    <DefaultTemplate
      i18n={r.req.i18n}
      locale={r.locale}
      params={view.params}
      payload={r.req.payload}
      permissions={r.permissions}
      searchParams={sp}
      user={r.req.user ?? undefined}
      visibleEntities={r.visibleEntities}
    >
      {body}
    </DefaultTemplate>
  )
}

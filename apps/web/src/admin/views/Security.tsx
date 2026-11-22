import type { AdminViewServerProps } from 'payload'
import { forceMfaReset, revokeSession } from '../actions'
import { Shell } from '../Shell'
import { tr } from '../labels'
import { Badge, Card, fmtDate } from '../ui'

type U = {
  id: number
  name: string
  email: string
  role: string
  lastLoginAt?: string
  totp?: { enabled?: boolean }
  sessions?: { id: string; createdAt?: string; expiresAt?: string }[]
}
type Login = {
  id: number
  at: string
  ip?: string
  userAgent?: string
  user?: { name?: string } | number
}

export async function Security(props: AdminViewServerProps) {
  const lang = props.initPageResult.req.i18n.language
  return (
    <Shell
      view={props}
      action="users.manage"
      title={tr(lang, 'security')}
      sub="Roles, MFA, sessions and sign-in history. Administrators only."
    >
      {async ({ payload }) => {
        const [users, history] = await Promise.all([
          payload.find({ collection: 'users', overrideAccess: true, depth: 0, limit: 200 }),
          payload.find({
            collection: 'login-history',
            overrideAccess: true,
            depth: 1,
            limit: 25,
            sort: '-at',
          }),
        ])
        return (
          <>
            <Card title="Users">
              <table className="ir-table">
                <caption className="ir-sr">Users</caption>
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Role</th>
                    <th scope="col">MFA</th>
                    <th scope="col">Last login</th>
                    <th scope="col">Active sessions</th>
                    <th scope="col">
                      <span className="ir-sr">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(users.docs as unknown as U[]).map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.name}
                        <br />
                        <span className="ir-muted">{u.email}</span>
                      </td>
                      <td>
                        <Badge>{u.role.replace('_', ' ')}</Badge>
                      </td>
                      <td>
                        <Badge tone={u.totp?.enabled ? 'ok' : 'warn'}>
                          {u.totp?.enabled ? 'enabled' : 'not set up'}
                        </Badge>
                      </td>
                      <td>{fmtDate(u.lastLoginAt)}</td>
                      <td>
                        {(u.sessions ?? []).length === 0 ? (
                          '—'
                        ) : (
                          <ul className="ir-list">
                            {(u.sessions ?? []).map((s) => (
                              <li key={s.id}>
                                <span>{fmtDate(s.createdAt)}</span>
                                <form action={revokeSession}>
                                  <input type="hidden" name="userId" value={u.id} />
                                  <input type="hidden" name="sessionId" value={s.id} />
                                  <button
                                    className="ir-btn ghost"
                                    type="submit"
                                    style={{ padding: '2px 8px' }}
                                  >
                                    Revoke
                                  </button>
                                </form>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td>
                        <form action={forceMfaReset}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button className="ir-btn ghost" type="submit">
                            Force MFA reset
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card title="Login history">
              <table className="ir-table">
                <caption className="ir-sr">Recent sign-ins</caption>
                <thead>
                  <tr>
                    <th scope="col">When</th>
                    <th scope="col">User</th>
                    <th scope="col">IP</th>
                    <th scope="col">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {(history.docs as unknown as Login[]).map((h) => (
                    <tr key={h.id}>
                      <td>{fmtDate(h.at)}</td>
                      <td>{typeof h.user === 'object' ? h.user.name : '—'}</td>
                      <td>{h.ip ?? '—'}</td>
                      <td>{(h.userAgent ?? '').slice(0, 60)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )
      }}
    </Shell>
  )
}

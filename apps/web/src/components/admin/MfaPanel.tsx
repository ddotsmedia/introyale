'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

type Props = { enabled: boolean; mode: 'sign-in' | 'account' }

/**
 * Two-factor authentication (opt-in for every role, D10).
 *  - mode "sign-in": the code screen shown after the password when the user has 2FA on.
 *  - mode "account": enable (QR + key, confirm a code, recovery codes) or disable (current password + code).
 */
export function MfaPanel({ enabled, mode }: Props) {
  const [uri, setUri] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [codes, setCodes] = useState<string[] | null>(null)
  const [on, setOn] = useState(enabled)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const post = async (path: string, body: unknown) => {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    return {
      ok: res.ok,
      status: res.status,
      data: (await res.json().catch(() => ({}))) as Record<string, unknown>,
    }
  }
  const factor = () => (useRecovery ? { recoveryCode: code } : { code })

  const enroll = async () => {
    const r = await post('/api/mfa/enroll', {})
    if (!r.ok || typeof r.data.otpauthUri !== 'string') {
      setMsg('Could not start setup. Sign in again.')
      return
    }
    setUri(r.data.otpauthUri)
    setQr(await QRCode.toDataURL(r.data.otpauthUri, { margin: 1, width: 220 }))
    setMsg(null)
  }

  const confirm = async () => {
    const r = await post('/api/mfa/confirm', { code })
    if (!r.ok) {
      setMsg('That code did not match. Try the current code from your app.')
      return
    }
    setCodes(Array.isArray(r.data.recoveryCodes) ? (r.data.recoveryCodes as string[]) : [])
    setOn(true)
    setUri(null)
    setCode('')
    setMsg(null)
  }

  const verify = async () => {
    const r = await post('/api/mfa/verify', factor())
    if (r.status === 429) {
      setMsg('Too many attempts. Wait ten minutes.')
      return
    }
    if (!r.ok) {
      setMsg('Invalid code.')
      return
    }
    window.location.assign('/admin')
  }

  const disable = async () => {
    const r = await post('/api/mfa/disable', { password, ...factor() })
    if (r.status === 429) {
      setMsg('Too many attempts. Wait ten minutes.')
      return
    }
    if (!r.ok) {
      setMsg('The password or the code is not correct.')
      return
    }
    setOn(false)
    setCode('')
    setPassword('')
    setCodes(null)
    setMsg('Two-factor authentication is now off.')
  }

  const factorInput = (id: string) => (
    <>
      <label htmlFor={id}>
        {useRecovery ? 'Recovery code' : 'Code from your authenticator app'}
      </label>
      <input
        id={id}
        inputMode={useRecovery ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value)
        }}
      />
      <button
        type="button"
        onClick={() => {
          setUseRecovery((v) => !v)
          setCode('')
        }}
      >
        {useRecovery ? 'Use an authenticator code' : 'Use a recovery code'}
      </button>
    </>
  )

  if (mode === 'sign-in') {
    return (
      <div className="space-y-6 max-w-xl">
        {msg && <p role="alert">{msg}</p>}
        {on ? (
          <section aria-labelledby="vf">
            <h2 id="vf">Enter your two-factor code</h2>
            {factorInput('c2')}
            <button
              type="button"
              onClick={() => {
                void verify()
              }}
            >
              Verify and continue
            </button>
          </section>
        ) : (
          <p>
            Two-factor authentication is off for your account.{' '}
            <a href="/admin">Continue to the dashboard</a>.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl" data-testid="mfa-account">
      {msg && <p role="alert">{msg}</p>}
      {!on && !uri && (
        <>
          <p>
            Two-factor authentication is off. Turn it on to require a code from an app when you sign
            in.
          </p>
          <button
            type="button"
            onClick={() => {
              void enroll()
            }}
          >
            Set up authenticator app
          </button>
        </>
      )}
      {!on && uri && qr && (
        <section aria-labelledby="scan">
          <h3 id="scan">1. Scan with your authenticator app</h3>
          <img src={qr} alt="QR code for your authenticator app" width={220} height={220} />
          <p>
            Or enter this key manually: <code>{uri.split('secret=')[1]?.split('&')[0]}</code>
          </p>
          <label htmlFor="c1">2. Enter the 6-digit code</label>
          <input
            id="c1"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
            }}
          />
          <button
            type="button"
            onClick={() => {
              void confirm()
            }}
          >
            Confirm
          </button>
        </section>
      )}
      {codes && (
        <section aria-labelledby="rc">
          <h3 id="rc">Recovery codes</h3>
          <p>Save these now. They are shown once and stored only as hashes.</p>
          <ul>
            {codes.map((c) => (
              <li key={c}>
                <code>{c}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
      {on && (
        <section aria-labelledby="off">
          <h3 id="off">Two-factor authentication is on</h3>
          <p>To turn it off, enter your current password and a code.</p>
          <label htmlFor="pw">Current password</label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
          />
          {factorInput('c3')}
          <button
            type="button"
            onClick={() => {
              void disable()
            }}
          >
            Turn off two-factor authentication
          </button>
        </section>
      )}
    </div>
  )
}

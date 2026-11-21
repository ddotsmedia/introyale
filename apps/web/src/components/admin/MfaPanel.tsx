'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

type Props = { requiresMfa: boolean; enabled: boolean }

/** TOTP enrolment and verification for administrator and publisher (D10). */
export function MfaPanel({ requiresMfa, enabled }: Props) {
  const [uri, setUri] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [codes, setCodes] = useState<string[] | null>(null)
  const [enabledNow, setEnabledNow] = useState(enabled)
  const [code, setCode] = useState('')
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

  const enroll = async () => {
    const r = await post('/api/mfa/enroll', {})
    if (!r.ok || typeof r.data.otpauthUri !== 'string') {
      setMsg('Could not start enrolment. Sign in again.')
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
    setEnabledNow(true)
    setCode('')
    setMsg(null)
  }

  const verify = async () => {
    const r = await post('/api/mfa/verify', { code })
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

  if (!requiresMfa) return <p>Your role does not require MFA.</p>

  return (
    <div className="space-y-6 max-w-xl">
      {msg && <p role="alert">{msg}</p>}
      {!enabledNow && !uri && (
        <button
          type="button"
          onClick={() => {
            void enroll()
          }}
          className="btn"
        >
          Set up authenticator app
        </button>
      )}
      {!enabledNow && uri && qr && (
        <section aria-labelledby="scan">
          <h2 id="scan">1. Scan with your authenticator app</h2>
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
          <h2 id="rc">Recovery codes</h2>
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
      {enabledNow && (
        <section aria-labelledby="vf">
          <h2 id="vf">Verify this session</h2>
          <label htmlFor="c2">Enter the code from your app</label>
          <input
            id="c2"
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
              void verify()
            }}
          >
            Verify and continue
          </button>
        </section>
      )}
    </div>
  )
}

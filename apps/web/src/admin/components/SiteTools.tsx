'use client'
import { useState, useTransition } from 'react'
import { sendTestEmail, testRedirect } from '../actions'

/** "Test URL" for the redirect manager: reports which rule (if any) answers a path. */
export function RedirectTester() {
  const [path, setPath] = useState('/')
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  return (
    <form
      className="ir-filters"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => setMsg((await testRedirect(path)).message))
      }}
    >
      <label>
        Test a path
        <input type="text" value={path} onChange={(e) => setPath(e.target.value)} />
      </label>
      <button className="ir-btn" type="submit" disabled={pending}>
        Test URL
      </button>
      <span role="status">{msg}</span>
    </form>
  )
}

export function SmtpTest() {
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  return (
    <div>
      <button
        className="ir-btn ghost"
        type="button"
        disabled={pending}
        onClick={() => start(async () => setMsg((await sendTestEmail()).message))}
      >
        Send test email
      </button>{' '}
      <span role="status">{msg}</span>
    </div>
  )
}

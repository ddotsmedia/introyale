'use client'

import { ui } from '@/messages/en'
import { useActionState, useEffect } from 'react'
import { track } from '@/lib/track'
import { submitContact, type ContactState } from '@/app/(site)/(chrome)/start/actions/contact'
import { AltchaWidget } from './AltchaWidget'

/** General contact form. Same guard chain as /start (honeypot, timing, proof-of-work, limits). */
export function ContactForm({
  startToken,
  consentText,
}: {
  startToken: string
  consentText?: string | null
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, null)
  useEffect(() => {
    if (state?.ok) track('contact_submit')
  }, [state])
  const errors = state && !state.ok ? (state.errors ?? {}) : {}
  return (
    <form action={action} className="mt-4 max-w-prose space-y-3" noValidate>
      <input type="hidden" name="startedAt" value={startToken} />
      <input type="hidden" name="sourcePage" value="/contact" />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state && !state.ok && state.message && (
        <p role="alert" className="border-error text-error border p-2">
          {state.message}
        </p>
      )}
      <Field name="name" label="Name" error={errors.name} autoComplete="name" />
      <Field name="email" label="Email" type="email" error={errors.email} autoComplete="email" />
      <Field
        name="phone"
        label="Phone (optional)"
        type="tel"
        error={errors.phone}
        autoComplete="tel"
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor="f-message" className="text-sm font-semibold">
          Message
        </label>
        <textarea
          id="f-message"
          name="message"
          rows={5}
          aria-invalid={!!errors.message}
          className="border-travertine bg-ivory border px-1.5 py-1"
        />
        {errors.message && <p className="text-error text-sm">{errors.message}</p>}
      </div>
      <label className="flex items-start gap-1.5 text-sm">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        <span>{consentText || ui.form.consent}</span>
      </label>
      {errors.consent && <p className="text-error text-sm">{errors.consent}</p>}
      <AltchaWidget />
      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-ivory min-h-5.5 px-3 py-1.5 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

function Field({
  name,
  label,
  error,
  type = 'text',
  autoComplete,
}: {
  name: string
  label: string
  error?: string
  type?: string
  autoComplete?: string
}) {
  const id = `f-${name}`
  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className="border-travertine bg-ivory min-h-5.5 border px-1.5"
      />
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  )
}

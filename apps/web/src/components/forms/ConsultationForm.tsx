'use client'

import { ui } from '@/messages/en'
import { useActionState, useEffect, useRef, useState } from 'react'
import { AltchaWidget } from './AltchaWidget'
import {
  submitConsultation,
  type ActionState,
} from '@/app/(site)/(chrome)/start/actions/consultation'

const STORAGE_KEY = 'introyale.consultation.v1'
const STEPS = ['Project', 'Space and timing', 'Contact', 'Review']
const SECTOR_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'hospitality-leisure', label: 'Hospitality and leisure' },
]
const STAGES = [
  { value: 'concept', label: 'Concept' },
  { value: 'design', label: 'Design' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'refurbishment', label: 'Refurbishment' },
  { value: 'not-sure', label: 'Not sure yet' },
]
const METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

type Props = {
  defaultSector?: string
  budgetBands: { label: string }[]
  startToken: string
  sourcePage: string
  consentText?: string | null
}

/** Four-step consultation (SPEC brief §10). One form, so every step submits together. */
export function ConsultationForm({
  defaultSector,
  budgetBands,
  startToken,
  sourcePage,
  consentText,
}: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitConsultation, null)
  const [step, setStep] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)

  // Restore saved values (sessionStorage is optional: failures are ignored).
  const restore = () => {
    const form = formRef.current
    if (!form) return
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as Record<
        string,
        string | string[]
      >
      for (const [name, value] of Object.entries(saved)) {
        const el = form.elements.namedItem(name)
        if (typeof value !== 'string') continue
        if (el instanceof HTMLInputElement && el.type !== 'checkbox') el.value = value
        if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) el.value = value
      }
    } catch {
      // Storage unavailable (private mode or blocked): the form still works.
    }
  }

  useEffect(() => {
    restore()
    const form = formRef.current
    if (form && defaultSector) {
      const sector = form.elements.namedItem('sector')
      if (sector instanceof HTMLSelectElement && !sector.value) sector.value = defaultSector
    }
    // Mount only: restore once, then keep the user's values.
  }, [defaultSector])

  // React clears uncontrolled fields after each action. After a validation error, put them back.
  useEffect(() => {
    if (state && !state.ok) restore()
  }, [state])

  // Save on every change. Only user-entered fields are stored (no React internals, tokens or honeypot).
  const save = () => {
    const form = formRef.current
    if (!form) return
    try {
      const skip = new Set(['altcha', 'startedAt', 'website', 'sourcePage'])
      const data = Object.fromEntries(
        Array.from(new FormData(form).entries())
          .filter(([k]) => !k.startsWith('$') && !skip.has(k))
          .map(([k, v]) => [k, typeof v === 'string' ? v : '']),
      )
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore
    }
  }
  useEffect(() => {
    if (state && state.ok) {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    }
  }, [state])

  const errors = state && !state.ok ? (state.errors ?? {}) : {}
  const errorList = Object.entries(errors)

  return (
    <form ref={formRef} action={action} onChange={save} className="mt-4 space-y-4" noValidate>
      <input type="hidden" name="startedAt" value={startToken} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      {/* Honeypot: hidden from people, visible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <ol className="flex flex-wrap gap-1.5 text-sm" aria-label="Steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? 'step' : undefined}
            className={i === step ? 'text-ink font-semibold' : 'text-taupe'}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>
      <div className="step-progress" aria-hidden="true">
        <span style={{ '--p': (step + 1) / STEPS.length } as React.CSSProperties} />
      </div>

      {state && !state.ok && (state.message || errorList.length > 0) && (
        <div role="alert" className="border-error text-error border p-2">
          {state.message && <p>{state.message}</p>}
          {errorList.length > 0 && (
            <ul className="mt-1 list-disc ps-2.5">
              {errorList.map(([k, m]) => (
                <li key={k}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <fieldset data-step-panel hidden={step !== 0} className="space-y-3">
        <legend className="font-display text-ink text-2xl">Your project</legend>
        <Select
          name="sector"
          label="Sector"
          options={SECTOR_OPTIONS}
          error={errors.sector}
          required
        />
        <Text name="projectType" label="Type of project" error={errors.projectType} />
        <Text name="location" label="District or area" error={errors.location} />
        <Text name="propertyType" label="Property type" error={errors.propertyType} />
        <Text name="approxArea" label="Approximate area" error={errors.approxArea} />
        <fieldset>
          <legend className="text-ink mb-1 text-sm font-semibold">Services of interest</legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {['Interior design', 'Fit-out', 'Refurbishment', 'Joinery', 'Furniture'].map((s) => (
              <label key={s} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="services" value={s} /> {s}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <fieldset data-step-panel hidden={step !== 1} className="space-y-3">
        <legend className="font-display text-ink text-2xl">Space and timing</legend>
        <Select
          name="stage"
          label="Where are you in the process?"
          options={STAGES}
          error={errors.stage}
          required
        />
        <Text name="targetStart" label="Target start" error={errors.targetStart} />
        {budgetBands.length > 0 && (
          <Select
            name="budgetBand"
            label="Budget band"
            options={budgetBands.map((b) => ({ value: b.label, label: b.label }))}
            error={errors.budgetBand}
          />
        )}
        <Area name="brief" label="Tell us about the project" error={errors.brief} rows={6} />
        <Text name="plansLink" label="Link to plans (optional, https)" error={errors.plansLink} />
      </fieldset>

      <fieldset data-step-panel hidden={step !== 2} className="space-y-3">
        <legend className="font-display text-ink text-2xl">Contact details</legend>
        <Text name="name" label="Name" error={errors.name} autoComplete="name" required />
        <Text
          name="email"
          label="Email"
          type="email"
          error={errors.email}
          autoComplete="email"
          required
        />
        <Text
          name="phone"
          label="Phone (optional)"
          type="tel"
          error={errors.phone}
          autoComplete="tel"
        />
        <Select
          name="preferredMethod"
          label="Preferred way to reply"
          options={METHODS}
          error={errors.preferredMethod}
          required
        />
        <Text name="preferredTime" label="Preferred time (optional)" error={errors.preferredTime} />
      </fieldset>

      <fieldset data-step-panel hidden={step !== 3} className="space-y-3">
        <legend className="font-display text-ink text-2xl">Review and send</legend>
        <p className="text-ink/90">{ui.form.review}</p>
        <label className="flex items-start gap-1.5 text-sm">
          <input type="checkbox" name="consent" required className="mt-0.5" />
          <span>{consentText || ui.form.consent}</span>
        </label>
        {errors.consent && <p className="text-error text-sm">{errors.consent}</p>}
        <AltchaWidget />
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => {
              setStep(step - 1)
            }}
            className="min-h-5.5 px-2 underline"
          >
            Back
          </button>
        )}
        {/* Both buttons stay mounted: swapping one for the other under the pointer made Chrome submit the form. */}
        <button
          type="button"
          hidden={step >= STEPS.length - 1}
          onClick={() => {
            setStep(step + 1)
          }}
          className="bg-ink text-ivory min-h-5.5 px-3 py-1.5"
        >
          Continue
        </button>
        <button
          type="submit"
          hidden={step < STEPS.length - 1}
          disabled={pending}
          className="bg-ink text-ivory min-h-5.5 px-3 py-1.5 disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </form>
  )
}

type Common = {
  name: string
  label: string
  error?: string
  required?: boolean
  autoComplete?: string
}

function Text({ name, label, error, type = 'text', ...rest }: Common & { type?: string }) {
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
        required={rest.required}
        autoComplete={rest.autoComplete}
        aria-invalid={!!error}
        className="border-travertine bg-ivory min-h-5.5 border px-1.5"
      />
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  )
}

function Area({ name, label, error, rows }: Common & { rows: number }) {
  const id = `f-${name}`
  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        aria-invalid={!!error}
        className="border-travertine bg-ivory border px-1.5 py-1"
      />
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  )
}

function Select({
  name,
  label,
  error,
  options,
  required,
}: Common & { options: { value: string; label: string }[] }) {
  const id = `f-${name}`
  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        aria-invalid={!!error}
        className="border-travertine bg-ivory min-h-5.5 border px-1.5"
      >
        <option value="">Choose</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  )
}

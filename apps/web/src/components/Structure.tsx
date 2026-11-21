import Link from 'next/link'
import type { ReactNode } from 'react'
import { Picture, type MediaInput } from './Picture'

/** Accordion built on native <details>: keyboard and screen-reader behaviour come from the platform. */
export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="divide-travertine divide-y border-y border-travertine">
      {items.map((item) => (
        <details key={item.question} className="group py-1.5">
          <summary className="font-display text-ink flex min-h-5.5 cursor-pointer list-none items-center justify-between text-lg">
            {item.question}
            <span aria-hidden="true" className="group-open:rotate-45 transition-transform">
              +
            </span>
          </summary>
          <p className="text-ink/90 pt-1">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}

/** Stepper: the current step carries aria-current="step". */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex gap-2 text-sm">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={i === current ? 'step' : undefined}
            className={i === current ? 'text-ink font-semibold' : 'text-taupe'}
          >
            <span className="me-0.5">{i + 1}.</span>
            {label}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function CtaBand({
  heading,
  text,
  href,
  label,
}: {
  heading: string
  text?: string | null
  href: string
  label: string
}) {
  return (
    <section className="bg-sand px-2 py-6 md:px-3">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-display text-ink text-3xl">{heading}</h2>
        {text && <p className="text-ink mt-1 max-w-prose">{text}</p>}
        <Link
          href={href}
          className="bg-ink text-ivory mt-3 inline-flex min-h-5.5 items-center px-3 py-1.5"
        >
          {label}
        </Link>
      </div>
    </section>
  )
}

export function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string
  name: string
  role?: string | null
}) {
  return (
    <figure className="max-w-prose">
      <blockquote className="font-display text-ink text-2xl">“{quote}”</blockquote>
      <figcaption className="text-taupe mt-2 text-sm">
        {name}
        {role ? `, ${role}` : ''}
      </figcaption>
    </figure>
  )
}

/** Renders nothing without recorded consent (SPEC §5.2). */
export function TeamCard({
  name,
  role,
  photo,
  consentGiven,
}: {
  name: string
  role: string
  photo?: MediaInput
  consentGiven: boolean
}) {
  if (!consentGiven) return null
  return (
    <article className="flex gap-2">
      <div className="bg-sand h-12 w-12 shrink-0 overflow-hidden">
        <Picture media={photo} sizes="96px" className="h-full w-full object-cover" />
      </div>
      <div>
        <h3 className="font-display text-ink text-lg">{name}</h3>
        <p className="text-taupe text-sm">{role}</p>
      </div>
    </article>
  )
}

export function ProcessTimeline({ steps }: { steps: { title: string; text?: string | null }[] }) {
  return (
    <ol className="border-bronze relative border-s-2 ps-3">
      {steps.map((s, i) => (
        <li key={s.title} className="mb-3">
          <h3 className="font-display text-ink text-lg">
            <span className="text-taupe me-1 text-sm">{i + 1}</span>
            {s.title}
          </h3>
          {s.text && <p className="text-ink/90 mt-0.5">{s.text}</p>}
        </li>
      ))}
    </ol>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-taupe text-sm">
      <ol className="flex flex-wrap gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${String(i)}`} className="flex gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="[&_h2]:font-display [&_h2]:text-ink [&_h2]:mt-4 [&_h2]:text-2xl [&_p]:mt-2 [&_p]:max-w-prose">
      {children}
    </div>
  )
}

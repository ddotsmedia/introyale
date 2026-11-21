import type { ReactNode } from 'react'
import { verifiedFact } from '@/lib/cms'
import { globalBySlug, whatsappHref } from '@/lib/site'
import { ui } from '@/messages/en'
import { container, SectionHeading, sectionPad, type BlockOf } from './shared'

/** Contact details from verified facts and the contact-info global. Each row renders only when it has a value (D13). */
export async function ContactInfo({ block }: { block: BlockOf<'contactInfo'> }) {
  const [address, phone, whatsapp, email, sales, info] = await Promise.all([
    verifiedFact('address'),
    verifiedFact('phone'),
    verifiedFact('whatsapp'),
    verifiedFact('email'),
    verifiedFact('sales_email'),
    globalBySlug('contact-info', 0),
  ])
  const wa = whatsappHref(whatsapp)
  type Row = { label: string; node: ReactNode }
  const rows = (
    [
      address ? { label: ui.address, node: address } : null,
      phone
        ? {
            label: ui.phone,
            node: <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>,
          }
        : null,
      wa && whatsapp ? { label: ui.whatsapp, node: <a href={wa}>{whatsapp}</a> } : null,
      email ? { label: ui.email, node: <a href={`mailto:${email}`}>{email}</a> } : null,
      sales ? { label: ui.sales, node: <a href={`mailto:${sales}`}>{sales}</a> } : null,
      block.showHours !== false && info.hours ? { label: ui.hours, node: info.hours } : null,
    ] as (Row | null)[]
  ).filter((r): r is Row => r !== null)
  return (
    <section className={`${sectionPad} bg-sand`}>
      <div className={`${container} grid gap-6 md:grid-cols-12 md:gap-10`}>
        <SectionHeading
          className="reveal md:col-span-5"
          heading={block.heading}
          intro={block.intro}
        />
        {rows.length > 0 && (
          <dl className="reveal md:col-span-7">
            {rows.map((r) => (
              <div
                key={r.label}
                className="border-ink/15 grid gap-1 border-t py-3 md:grid-cols-[11rem_1fr]"
              >
                <dt className="eyebrow">{r.label}</dt>
                <dd className="font-display text-2xl leading-snug tracking-tight">{r.node}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}

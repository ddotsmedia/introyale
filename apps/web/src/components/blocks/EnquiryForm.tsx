import { signStartedAt } from '@/lib/bot'
import { globalBySlug } from '@/lib/site'
import { signingKey } from '@/lib/guard'
import { ConsultationForm } from '../forms/ConsultationForm'
import { ContactForm } from '../forms/ContactForm'
import { container, SectionHeading, sectionPad, type BlockOf } from './shared'

/** Contact form or the multi-step consultation request, with a signed start token against bots (M8). */
export async function EnquiryForm({
  block,
  sector,
}: {
  block: BlockOf<'enquiryForm'>
  sector?: string
}) {
  const startToken = signStartedAt(Date.now(), signingKey())
  const consultation = block.form === 'consultation'
  const settings = await globalBySlug('consultation-settings', 0)
  // Budget bands stay hidden until set in the CMS (D12).
  const bands = (settings.budgetBands ?? []).flatMap((b) =>
    typeof b.label === 'string' && b.label !== '' ? [{ label: b.label }] : [],
  )
  return (
    <section className={`${sectionPad} bg-ivory`}>
      <div className={`${container} grid gap-6 md:grid-cols-12 md:gap-10`}>
        <SectionHeading
          className="reveal md:col-span-4"
          heading={block.heading}
          intro={block.intro}
        />
        <div
          className={`reveal md:col-span-8 ${block.heading || block.intro ? '' : 'md:col-start-3'}`}
        >
          {consultation ? (
            <ConsultationForm
              defaultSector={sector}
              budgetBands={bands}
              startToken={startToken}
              sourcePage="/start"
              consentText={settings.consentText}
            />
          ) : (
            <ContactForm startToken={startToken} consentText={settings.consentText} />
          )}
        </div>
      </div>
    </section>
  )
}

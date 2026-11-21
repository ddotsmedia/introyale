import { Breadcrumbs } from '@/components/Structure'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { globalDoc, verifiedFact } from '@/lib/cms'
import { signStartedAt } from '@/lib/bot'
import { signingKey } from '@/lib/guard'

export const dynamic = 'force-dynamic'

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const sector = typeof sp.sector === 'string' ? sp.sector : undefined
  const [settings, whatsapp] = await Promise.all([
    globalDoc('consultation-settings'),
    verifiedFact('whatsapp'),
  ])
  // Budget bands are hidden until set in the CMS (D12).
  const bands = (settings.budgetBands ?? []).flatMap((b) =>
    typeof b.label === 'string' && b.label !== '' ? [{ label: b.label }] : [],
  )
  const digits = whatsapp ? whatsapp.replace(/[^\d]/g, '') : null
  const startToken = signStartedAt(Date.now(), signingKey())

  return (
    <section className="mx-auto max-w-[960px] px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Start a project' }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">Start a project</h1>
      <p className="text-ink/90 mt-4 max-w-prose">
        Four short steps. Your answers stay in this browser until you send them.
      </p>
      {digits && (
        <p className="mt-4 text-sm">
          Prefer messaging?{' '}
          <a
            href={`https://wa.me/${digits}?text=${encodeURIComponent('Hello, I would like to start a project.')}`}
            className="underline"
          >
            Message us on WhatsApp
          </a>
        </p>
      )}
      <ConsultationForm
        defaultSector={sector}
        budgetBands={bands}
        startToken={startToken}
        sourcePage="/start"
      />
    </section>
  )
}

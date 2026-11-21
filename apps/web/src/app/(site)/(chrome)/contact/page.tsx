import Link from 'next/link'
import { Breadcrumbs } from '@/components/Structure'
import { ContactForm } from '@/components/forms/ContactForm'
import { verifiedFact } from '@/lib/cms'
import { signStartedAt } from '@/lib/bot'
import { signingKey } from '@/lib/guard'

export const dynamic = 'force-dynamic'

/** NAP block: each line renders only when its fact is verified (D13). Plus the general form (M8). */
export default async function ContactPage() {
  const [address, phone, email, whatsapp] = await Promise.all([
    verifiedFact('address'),
    verifiedFact('phone'),
    verifiedFact('email'),
    verifiedFact('whatsapp'),
  ])
  const digits = whatsapp ? whatsapp.replace(/[^\d]/g, '') : null
  const startToken = signStartedAt(Date.now(), signingKey())
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
      <h1 className="font-display text-ink mt-6 text-4xl">Contact</h1>
      <address className="text-ink mt-6 space-y-3 not-italic">
        {address && <p>{address}</p>}
        {phone && (
          <p>
            Phone{' '}
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="underline">
              {phone}
            </a>
          </p>
        )}
        {email && (
          <p>
            Email{' '}
            <a href={`mailto:${email}`} className="underline">
              {email}
            </a>
          </p>
        )}
        {digits && (
          <p>
            <Link href={`https://wa.me/${digits}`} className="underline">
              WhatsApp
            </Link>
          </p>
        )}
      </address>
      <ContactForm startToken={startToken} />
    </section>
  )
}

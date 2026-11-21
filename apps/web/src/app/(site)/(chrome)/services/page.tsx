import type { Metadata } from 'next'
import { ServicesList } from '@/components/blocks/ServicesList'
import { PageHeader } from '@/components/PageHeader'
import { pageMetadata } from '@/lib/seo'
import { ui } from '@/messages/en'

export const dynamic = 'force-dynamic'

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({ fallbackTitle: ui.services, path: '/services' })

export default function ServicesIndex() {
  return (
    <>
      <PageHeader title={ui.services} />
      <ServicesList block={{ blockType: 'servicesList' }} />
    </>
  )
}

import type { Metadata } from 'next'
import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'

export const dynamic = 'force-dynamic'

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata('clients', '/clients')

export default function Page() {
  return <CmsPage slug="clients" />
}

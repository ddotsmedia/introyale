import type { Metadata } from 'next'
import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'

export const dynamic = 'force-dynamic'

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata('privacy', '/privacy')

export default function Page() {
  return <CmsPage slug="privacy" />
}

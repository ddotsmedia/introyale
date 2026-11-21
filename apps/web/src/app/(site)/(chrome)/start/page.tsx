import type { Metadata } from 'next'
import { CmsPage, cmsPageMetadata } from '@/components/CmsPage'

export const dynamic = 'force-dynamic'

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata('start', '/start')

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const sector =
    typeof sp.sector === 'string' && /^[a-z0-9-]{1,80}$/.test(sp.sector) ? sp.sector : undefined
  return <CmsPage slug="start" sector={sector} />
}

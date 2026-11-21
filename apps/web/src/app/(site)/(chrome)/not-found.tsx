import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { container, sectionPad } from '@/components/blocks/shared'
import { ui } from '@/messages/en'

export default function NotFound() {
  return (
    <>
      <PageHeader title={ui.notFound.title} intro={ui.notFound.body} />
      <div className={`${sectionPad} bg-ivory`}>
        <div className={container}>
          <Link href="/" className="eyebrow border-b border-current pb-0.5">
            {ui.notFound.link}
          </Link>
        </div>
      </div>
    </>
  )
}

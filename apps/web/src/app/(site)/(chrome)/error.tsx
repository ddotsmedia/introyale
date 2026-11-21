'use client'
import { PageHeader } from '@/components/PageHeader'
import { ui } from '@/messages/en'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <PageHeader title={ui.error.title} intro={ui.error.body} />
      <div className="bg-ivory px-2 py-8 md:px-4">
        <button
          type="button"
          onClick={() => {
            reset()
          }}
          className="eyebrow border-b border-current pb-0.5"
        >
          {ui.error.retry}
        </button>
      </div>
    </>
  )
}

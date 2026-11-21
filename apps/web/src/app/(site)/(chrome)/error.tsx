'use client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 text-center md:px-6">
      <h1 className="font-display text-ink text-4xl">Something went wrong</h1>
      <p className="text-taupe mt-4">Please try again in a moment.</p>
      <button
        type="button"
        onClick={() => {
          reset()
        }}
        className="mt-8 underline"
      >
        Try again
      </button>
    </section>
  )
}

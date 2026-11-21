import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-24 text-center md:px-6">
      <h1 className="font-display text-ink text-4xl">Page not found</h1>
      <p className="text-taupe mt-4">The page you were looking for has moved or does not exist.</p>
      <Link href="/" className="mt-8 inline-block underline">
        Back to home
      </Link>
    </section>
  )
}

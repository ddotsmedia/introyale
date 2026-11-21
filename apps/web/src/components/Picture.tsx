import { preload } from 'react-dom'

export type MediaVariant = { url?: string | null; width?: number | null } | null | undefined

export type MediaLike = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, MediaVariant> | null
} | null

/** A Payload relation: populated object, bare ID (unresolved), or empty. */
export type MediaInput = MediaLike | number | null | undefined

type Variant = { url: string; width: number }

/** Variant keys are w<px> (WebP) and a<px> (AVIF), see collections/Media.ts. */
function srcSetFor(
  sizes: Record<string, MediaVariant> | null | undefined,
  prefix: 'a' | 'w',
): string {
  return Object.entries(sizes ?? {})
    .filter(([key]) => key.startsWith(prefix))
    .map(([, v]) => v)
    .filter((v): v is Variant => !!v?.url && !!v.width)
    .map((v) => `${v.url} ${String(v.width)}w`)
    .join(', ')
}

/**
 * Responsive image: AVIF then WebP sources with a plain <img> fallback. Payload serves the variants;
 * Next image optimisation is off (SPEC C12). Missing alt or URL renders nothing (SPEC §5.2, D13).
 */
export function Picture({
  media,
  sizes = '100vw',
  priority = false,
  className,
}: {
  media: MediaInput
  sizes?: string
  priority?: boolean
  className?: string
}) {
  const m = typeof media === 'object' ? media : null
  if (!m?.url || !m.alt) return null
  const avif = srcSetFor(m.sizes, 'a')
  const webp = srcSetFor(m.sizes, 'w')
  // The above-the-fold image is preloaded (only the page that marks it priority emits this).
  if (priority) {
    const set = avif || webp
    preload(m.url, {
      as: 'image',
      imageSrcSet: set || undefined,
      imageSizes: set ? sizes : undefined,
      fetchPriority: 'high',
      type: avif ? 'image/avif' : webp ? 'image/webp' : undefined,
    })
  }
  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} sizes={sizes} />}
      {webp && <source type="image/webp" srcSet={webp} sizes={sizes} />}
      <img
        src={m.url}
        alt={m.alt}
        width={m.width ?? undefined}
        height={m.height ?? undefined}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
      />
    </picture>
  )
}

/** A Payload relation: populated object, bare ID (unresolved), or empty. */
export type MediaInput = MediaLike | number | null | undefined

export type MediaVariant = { url?: string | null; width?: number | null } | null | undefined

export type MediaLike = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, MediaVariant> | null
} | null

/** Renders srcset from Payload's generated variants. Missing alt or URL renders nothing (SPEC §5.2). */
export function Picture({
  media,
  sizes = '100vw',
  priority = false,
  className,
}: {
  /** Payload relations are IDs until populated: an unresolved ID renders nothing. */
  media: MediaInput
  sizes?: string
  priority?: boolean
  className?: string
}) {
  const m = typeof media === 'object' ? media : null
  if (!m?.url || !m.alt) return null
  const variants = Object.values(m.sizes ?? {}).filter(
    (v): v is { url: string; width: number } => !!v?.url && !!v.width,
  )
  const srcSet = variants.map((v) => `${v.url} ${String(v.width)}w`).join(', ')
  return (
    // Plain img: Payload serves the variants; Next image optimisation is off (SPEC C12).
    <img
      src={m.url}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={m.alt}
      width={m.width ?? undefined}
      height={m.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}

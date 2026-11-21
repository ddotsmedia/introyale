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
  media: MediaLike | undefined
  sizes?: string
  priority?: boolean
  className?: string
}) {
  if (!media?.url || !media.alt) return null
  const variants = Object.values(media.sizes ?? {}).filter(
    (v): v is { url: string; width: number } => !!v?.url && !!v.width,
  )
  const srcSet = variants.map((v) => `${v.url} ${String(v.width)}w`).join(', ')
  return (
    // Plain img: Payload serves the variants; Next image optimisation is off (SPEC C12).
    <img
      src={media.url}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={media.alt}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}

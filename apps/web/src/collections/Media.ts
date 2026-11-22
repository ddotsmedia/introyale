import { ValidationError, type CollectionConfig, type Where } from 'payload'
import sharp from 'sharp'
import { actionAllowed, allow } from '../lib/access'

const MB = 1024 * 1024

/** Tiny blurred preview (a 10px data URI, about 250 bytes) and the dominant colour, for blur-up image loading. */
export async function placeholderFor(
  input: Buffer | string,
): Promise<{ lqip: string; dominant: string }> {
  const img = sharp(input).rotate()
  const [tiny, stats] = await Promise.all([
    img.clone().resize(10, 10, { fit: 'inside' }).jpeg({ quality: 35 }).toBuffer(),
    img.clone().resize(1, 1, { fit: 'cover' }).raw().toBuffer(),
  ])
  const hex = [...stats.subarray(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('')
  return { lqip: `data:image/jpeg;base64,${tiny.toString('base64')}`, dominant: `#${hex}` }
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: allow('media.write'),
    read: ({ req }) => {
      if (req.user) return true
      // Public: only approved, non-confidential media.
      const publicMedia: Where = {
        and: [{ usageApproved: { equals: true } }, { confidential: { not_equals: true } }],
      }
      return publicMedia
    },
    update: allow('media.write'),
    delete: allow('media.write'),
  },
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        if (req.file && req.file.size > 25 * MB) {
          throw new ValidationError({
            errors: [{ path: 'filename', message: 'File exceeds 25 MB' }],
            req,
          })
        }
        // Blur-up placeholder for new uploads (existing files are backfilled by seed-motion).
        if (req.file && req.file.mimetype.startsWith('image/') && req.file.data.length) {
          try {
            Object.assign(data, await placeholderFor(req.file.data))
          } catch {
            // A placeholder is optional; the upload still succeeds without one.
          }
        }
        return data
      },
    ],
  },
  upload: {
    staticDir: process.env.MEDIA_DIR ?? 'media',
    // SVG is excluded at launch (sanitisation not yet in place); see docs/decisions-log.md.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'],
    // Sizes per SPEC §5.2 in WebP (w*) and AVIF (a*). Sharp strips EXIF on output.
    imageSizes: [480, 768, 1080, 1440, 1920, 2560].flatMap((w) => [
      {
        name: `w${String(w)}`,
        width: w,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: `a${String(w)}`,
        width: w,
        formatOptions: { format: 'avif', options: { quality: 55, effort: 2 } },
      },
    ]),
    focalPoint: true,
  },
  fields: [
    { name: 'alt', type: 'text', localized: true, required: true },
    { name: 'caption', type: 'text', localized: true },
    { name: 'credit', type: 'text' },
    {
      name: 'usageApproved',
      type: 'checkbox',
      defaultValue: false,
      access: { update: ({ req }) => actionAllowed(req, 'workflow.approve') },
    },
    {
      name: 'usageApprovedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    { name: 'confidential', type: 'checkbox', defaultValue: false },
    { name: 'lqip', type: 'text', admin: { hidden: true, readOnly: true } },
    { name: 'dominant', type: 'text', admin: { hidden: true, readOnly: true } },
    { name: 'tags', type: 'text', hasMany: true },
    {
      name: 'folder',
      type: 'text',
      index: true,
      admin: { description: 'Library folder, e.g. Residential/Villas' },
    },
  ],
}

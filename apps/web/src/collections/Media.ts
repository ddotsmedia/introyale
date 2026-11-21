import { ValidationError, type CollectionConfig, type Where } from 'payload'
import { actionAllowed, allow } from '../lib/access'

const MB = 1024 * 1024

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
      ({ req, data }) => {
        if (req.file && req.file.size > 25 * MB) {
          throw new ValidationError({
            errors: [{ path: 'filename', message: 'File exceeds 25 MB' }],
            req,
          })
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
  ],
}

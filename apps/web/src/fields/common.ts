import type { Field } from 'payload'

export const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'In review', value: 'in_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
] as const

/** Four-state workflow group (SPEC §5.1). Transitions are enforced by hooks/workflow.ts. */
export const workflowField: Field = {
  name: 'workflow',
  type: 'group',
  admin: { position: 'sidebar' },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [...STATUS_OPTIONS],
      index: true,
    },
    { name: 'submittedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'approvedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'publishedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'reviewNotes', type: 'textarea' },
    {
      name: 'publishAt',
      type: 'date',
      admin: {
        description:
          'Scheduled publication (approved items only; the worker publishes at this time)',
      },
    },
    { name: 'scheduledBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
  ],
}

/** SEO group (SPEC §5.1): titles ≤ 60, descriptions ≤ 160. */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  fields: [
    { name: 'metaTitle', type: 'text', localized: true, maxLength: 60 },
    { name: 'metaDescription', type: 'textarea', localized: true, maxLength: 160 },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
    { name: 'canonicalOverride', type: 'text' },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
}

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar' },
}

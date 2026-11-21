import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { allow, publicReadPublished } from '../lib/access'
import { seoField, slugField, workflowField } from '../fields/common'
import { auditAfterChange, auditAfterDelete, publishGuard, workflowGuard } from '../hooks/workflow'

const versions = { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 } as const

export const JournalPosts: CollectionConfig = {
  slug: 'journal-posts',
  versions,
  access: {
    create: allow('content.write'),
    read: publicReadPublished,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  hooks: {
    beforeChange: [workflowGuard, publishGuard],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField,
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'body', type: 'richText', localized: true, editor: lexicalEditor() },
    { name: 'author', type: 'relationship', relationTo: 'team-members' },
    { name: 'categories', type: 'relationship', relationTo: 'journal-categories', hasMany: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'reviewedAt', type: 'date' },
    { name: 'citations', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
    { name: 'relatedProjects', type: 'relationship', relationTo: 'projects', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    seoField,
    workflowField,
  ],
}

export const JournalCategories: CollectionConfig = {
  slug: 'journal-categories',
  access: {
    create: allow('content.write'),
    read: () => true,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField,
    { name: 'description', type: 'textarea', localized: true },
  ],
}

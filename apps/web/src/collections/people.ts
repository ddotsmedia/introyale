import type { CollectionConfig } from 'payload'
import { allow, publicReadPublished } from '../lib/access'
import { seoField, slugField, workflowField } from '../fields/common'
import { auditAfterChange, auditAfterDelete, publishGuard, workflowGuard } from '../hooks/workflow'
import { requireEvidence } from '../hooks/evidence'

const versions = { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 } as const
const workflowHooks = {
  beforeChange: [workflowGuard, publishGuard],
  afterChange: [auditAfterChange],
  afterDelete: [auditAfterDelete],
}

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  versions,
  access: {
    create: allow('content.write'),
    read: publicReadPublished,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  hooks: workflowHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField,
    { name: 'role', type: 'text', localized: true, required: true },
    { name: 'bio', type: 'textarea', localized: true },
    {
      name: 'credentials',
      type: 'array',
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 0 },
    {
      name: 'consent',
      type: 'group',
      fields: [
        { name: 'given', type: 'checkbox', defaultValue: false },
        { name: 'date', type: 'date' },
        { name: 'evidence', type: 'text' },
      ],
    },
    seoField,
    workflowField,
  ],
}

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  versions,
  access: {
    create: allow('content.write'),
    read: publicReadPublished,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  hooks: workflowHooks,
  fields: [
    { name: 'quote', type: 'textarea', localized: true, required: true },
    { name: 'attributionName', type: 'text', required: true },
    { name: 'attributionRole', type: 'text' },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    {
      name: 'permission',
      type: 'group',
      fields: [
        { name: 'given', type: 'checkbox', defaultValue: false },
        { name: 'evidence', type: 'text' },
      ],
    },
    workflowField,
  ],
}

export const Clients: CollectionConfig = {
  slug: 'clients',
  access: {
    create: allow('content.write'),
    read: () => true,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'sector', type: 'relationship', relationTo: 'sectors' },
    // Logos render only when permission is recorded (D13).
    { name: 'logoPermission', type: 'checkbox', defaultValue: false },
  ],
}

export const Awards: CollectionConfig = {
  slug: 'awards',
  access: {
    create: allow('content.write'),
    read: () => true,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  hooks: { beforeChange: [requireEvidence] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'issuer', type: 'text' },
    { name: 'year', type: 'number' },
    { name: 'evidenceUrl', type: 'text' },
    { name: 'evidenceFile', type: 'upload', relationTo: 'media' },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
  ],
}

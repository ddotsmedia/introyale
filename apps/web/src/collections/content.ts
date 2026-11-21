import type { CollectionConfig, CollectionSlug, Field } from 'payload'
import { allow, publicReadPublished } from '../lib/access'
import { seoField, slugField, workflowField } from '../fields/common'
import { auditAfterChange, auditAfterDelete, publishGuard, workflowGuard } from '../hooks/workflow'

const versions = { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 } as const

/** Shared hooks for every collection that carries the four-state workflow. */
const workflowHooks = {
  beforeChange: [workflowGuard, publishGuard],
  afterChange: [auditAfterChange],
  afterDelete: [auditAfterDelete],
}

const rel = (name: string, relationTo: CollectionSlug, hasMany = false): Field =>
  ({
    name,
    type: 'relationship',
    relationTo,
    hasMany,
  }) as Field

export const Sectors: CollectionConfig = {
  slug: 'sectors',
  labels: { singular: 'Sector', plural: 'Sectors' },
  versions,
  access: {
    create: allow('content.write'),
    read: publicReadPublished,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  hooks: workflowHooks,
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField,
    { name: 'intro', type: 'textarea', localized: true },
    rel('hero', 'media'),
    rel('featuredProjects', 'projects', true),
    rel('faqs', 'faqs', true),
    seoField,
    workflowField,
  ],
}

export const PropertyTypes: CollectionConfig = {
  slug: 'property-types',
  access: {
    create: allow('content.write'),
    read: () => true,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    rel('sector', 'sectors'),
  ],
}

export const Services: CollectionConfig = {
  slug: 'services',
  versions,
  access: {
    create: allow('content.write'),
    read: publicReadPublished,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  hooks: workflowHooks,
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField,
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'audience', type: 'textarea', localized: true },
    { name: 'scope', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
    {
      name: 'deliverables',
      type: 'array',
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    {
      name: 'processSteps',
      type: 'array',
      fields: [{ name: 'step', type: 'text', required: true }],
    },
    rel('faqs', 'faqs', true),
    rel('proofProjects', 'projects', true),
    {
      name: 'confirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Publish only when confirmed (D6).' },
    },
    seoField,
    workflowField,
  ],
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  versions,
  access: {
    create: allow('project.write'),
    read: publicReadPublished,
    update: allow('project.write'),
    delete: allow('project.write'),
  },
  hooks: workflowHooks,
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      name: 'publicTitle',
      type: 'text',
      localized: true,
      admin: { description: 'Confidentiality-safe title shown publicly.' },
    },
    slugField,
    rel('sector', 'sectors'),
    rel('propertyType', 'property-types'),
    {
      name: 'areaLabel',
      type: 'text',
      required: true,
      admin: { description: 'District only, never an exact address.' },
    },
    { name: 'year', type: 'number', required: true },
    { name: 'approxAreaSqm', type: 'number' },
    rel('services', 'services', true),
    {
      name: 'stage',
      type: 'select',
      options: ['concept', 'design', 'delivery', 'completed'].map((v) => ({ label: v, value: v })),
    },
    ...(
      [
        'brief',
        'constraints',
        'concept',
        'spacePlanning',
        'materials',
        'joinery',
        'technicalMep',
        'deliveryModel',
        'timelineLabel',
        'outcome',
      ] as const
    ).map((name) => ({ name, type: 'textarea' as const, localized: true })),
    rel('hero', 'media'),
    rel('gallery', 'media', true),
    {
      name: 'beforeAfter',
      type: 'array',
      fields: [
        rel('before', 'media'),
        rel('after', 'media'),
        { name: 'caption', type: 'text', localized: true },
      ],
    },
    {
      name: 'plans',
      type: 'array',
      fields: [
        rel('image', 'media'),
        {
          name: 'hotspots',
          type: 'array',
          fields: [
            { name: 'x', type: 'number', required: true, min: 0, max: 100 },
            { name: 'y', type: 'number', required: true, min: 0, max: 100 },
            { name: 'label', type: 'text', localized: true, required: true },
            rel('media', 'media'),
          ],
        },
      ],
    },
    rel('testimonial', 'testimonials'),
    rel('team', 'team-members', true),
    rel('related', 'projects', true),
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'clientApproval',
      type: 'group',
      fields: [
        { name: 'approved', type: 'checkbox', defaultValue: false },
        { name: 'approvedBy', type: 'text' },
        { name: 'date', type: 'date' },
        { name: 'evidence', type: 'text' },
      ],
    },
    seoField,
    workflowField,
  ],
}

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  access: {
    create: allow('content.write'),
    read: () => true,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  fields: [
    { name: 'question', type: 'text', localized: true, required: true },
    { name: 'answer', type: 'textarea', localized: true, required: true },
    { name: 'topic', type: 'text' },
    { name: 'eligibleForSchema', type: 'checkbox', defaultValue: false },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  versions,
  access: {
    create: allow('content.write'),
    read: publicReadPublished,
    update: allow('content.write'),
    delete: allow('content.write'),
  },
  hooks: workflowHooks,
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField,
    { name: 'intro', type: 'textarea', localized: true },
    rel('hero', 'media'),
    { name: 'body', type: 'textarea', localized: true },
    seoField,
    workflowField,
  ],
}

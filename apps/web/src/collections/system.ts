import type { CollectionConfig } from 'payload'
import { ValidationError, Forbidden } from 'payload'
import { allow, enquiriesRead } from '../lib/access'
import { can, type Role } from '../lib/roles'
import { auditAfterChange } from '../hooks/workflow'

/** Facts Register. Only verified facts are public; verifying needs facts.verify (SPEC §5.4). */
export const Facts: CollectionConfig = {
  slug: 'facts',
  labels: { singular: 'Fact', plural: 'Facts Register' },
  access: {
    create: allow('facts.verify'),
    read: ({ req }) => (req.user ? true : { status: { equals: 'verified' } }),
    update: allow('facts.verify'),
    delete: allow('facts.verify'),
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        const d = data as { status?: string }
        if (
          d.status === 'verified' &&
          !can((req.user as { role?: Role } | null)?.role, 'facts.verify')
        ) {
          throw new Forbidden(req.t)
        }
        if (d.status === 'verified') {
          return { ...d, verifiedBy: req.user?.id, verifiedAt: new Date().toISOString() }
        }
        return data
      },
    ],
    afterChange: [auditAfterChange],
  },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'value', type: 'text' },
    { name: 'displayText', type: 'text', localized: true },
    { name: 'source', type: 'text' },
    { name: 'evidence', type: 'text' },
    { name: 'verifiedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'verifiedAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      options: ['unverified', 'verified', 'retired'].map((v) => ({ label: v, value: v })),
    },
  ],
}

/** Enquiries are the lead system of record. Never exposed publicly or via GraphQL (SPEC §5.2). */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  access: {
    create: () => false, // written only by server actions (M8) with overrideAccess
    read: enquiriesRead,
    update: allow('users.manage'),
    delete: allow('users.manage'),
  },
  admin: { useAsTitle: 'ref' },
  fields: [
    {
      name: 'ref',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'IR-YYYY-NNNN' },
    },
    {
      name: 'type',
      type: 'select',
      options: ['consultation', 'general'].map((v) => ({ label: v, value: v })),
    },
    { name: 'projectType', type: 'text' },
    { name: 'sector', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'propertyType', type: 'text' },
    { name: 'approxArea', type: 'text' },
    { name: 'services', type: 'text', hasMany: true },
    { name: 'stage', type: 'text' },
    { name: 'targetStart', type: 'text' },
    { name: 'budgetBand', type: 'text' },
    { name: 'brief', type: 'textarea' },
    { name: 'plansLink', type: 'text' },
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'preferredMethod', type: 'text' },
    { name: 'preferredTime', type: 'text' },
    {
      name: 'consent',
      type: 'group',
      fields: [
        { name: 'given', type: 'checkbox' },
        { name: 'textVersion', type: 'text' },
        { name: 'at', type: 'date' },
      ],
    },
    { name: 'sourcePage', type: 'text' },
    { name: 'utm', type: 'json' },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    {
      name: 'deliveryStatus',
      type: 'group',
      fields: [
        { name: 'email', type: 'text' },
        { name: 'crm', type: 'text' },
        { name: 'attempts', type: 'number', defaultValue: 0 },
        { name: 'lastError', type: 'text' },
      ],
    },
    { name: 'retentionUntil', type: 'date' },
  ],
}

/** Redirect map compiled at startup and refreshed on change (SPEC §5.2). */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  access: {
    create: allow('redirects.manage'),
    read: allow('redirects.manage'),
    update: allow('redirects.manage'),
    delete: allow('redirects.manage'),
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        const d = data as { from?: string; to?: string; type?: string }
        if (d.from && d.to && d.from === d.to) {
          throw new ValidationError({
            errors: [{ path: 'to', message: 'Redirect cannot point to itself' }],
            req,
          })
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true },
    { name: 'to', type: 'text' },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { label: '301', value: '301' },
        { label: '302', value: '302' },
        { label: '410', value: '410' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}

/** Append-only. Admins read; no one edits or deletes through the API. */
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  access: {
    create: () => false, // written by hooks with overrideAccess
    read: allow('users.manage'),
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'actor', type: 'relationship', relationTo: 'users' },
    { name: 'action', type: 'text', required: true },
    { name: 'collection', type: 'text', required: true },
    { name: 'docId', type: 'text', required: true },
    { name: 'fromStatus', type: 'text' },
    { name: 'toStatus', type: 'text' },
    { name: 'diffSummary', type: 'text' },
    { name: 'ip', type: 'text' },
    { name: 'at', type: 'date', required: true },
  ],
}

/** Fixed-window counters for rate limiting (lib/rateLimit.ts). Written with a raw atomic upsert. */
export const RateLimits: CollectionConfig = {
  slug: 'rate-limits',
  access: {
    create: () => false,
    read: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
  ],
}

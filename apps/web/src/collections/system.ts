import { isSafeRedirectTarget } from '../lib/legacyRedirects'
import { invalidateRedirects } from '../lib/redirects'
import type { Access, CollectionConfig } from 'payload'
import { ValidationError, Forbidden } from 'payload'
import { allow, enquiriesRead } from '../lib/access'
import { can, type Role } from '../lib/roles'
import { auditAfterChange } from '../hooks/workflow'
import { LEAD_STATUSES } from '../lib/leads'
import { onNewEnquiry, type Lead } from '../lib/crm'

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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }): Promise<void> => {
        // Sector routing and duplicate linking run once, when the lead is created.
        if (operation === 'create') await onNewEnquiry(req.payload, doc as Lead, req)
      },
    ],
  },
  admin: {
    useAsTitle: 'ref',
    defaultColumns: ['ref', 'name', 'status', 'assignedTo', 'followUpAt'],
  },
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
    {
      name: 'attribution',
      type: 'json',
      admin: {
        readOnly: true,
        description:
          'First and last touch, pages viewed before submit (first-party analytics, same-day visitor)',
      },
    },
    {
      name: 'score',
      type: 'number',
      index: true,
      admin: { readOnly: true, description: 'Automatic lead score 0-100' },
    },
    { name: 'scoreReasons', type: 'json', admin: { readOnly: true } },
    {
      name: 'firstContactAt',
      type: 'date',
      admin: { readOnly: true, description: 'First response to the enquirer (SLA clock stops)' },
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    // CRM (admin v2). Changed only through server actions in admin/actions.ts, which audit every change.
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      index: true,
      options: LEAD_STATUSES.map((v) => ({ label: v, value: v })),
    },
    { name: 'lostReason', type: 'text' },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: ['low', 'normal', 'high'].map((v) => ({ label: v, value: v })),
    },
    { name: 'followUpAt', type: 'date', index: true },
    { name: 'estimatedValue', type: 'number', admin: { description: 'AED' } },
    { name: 'tags', type: 'text', hasMany: true },
    {
      name: 'notes',
      type: 'array',
      fields: [
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'text', type: 'textarea', required: true },
        { name: 'at', type: 'date', required: true },
      ],
    },
    {
      name: 'activity',
      type: 'array',
      admin: { description: 'Automatic timeline: status changes, assignments, emails' },
      fields: [
        { name: 'kind', type: 'text', required: true },
        { name: 'text', type: 'text', required: true },
        { name: 'actor', type: 'relationship', relationTo: 'users' },
        { name: 'at', type: 'date', required: true },
      ],
    },
    { name: 'related', type: 'relationship', relationTo: 'enquiries', hasMany: true },
    {
      name: 'isTest',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Local demo data' },
    },
    { name: 'unassignedAlertAt', type: 'date', admin: { readOnly: true } },
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
        // Targets must be site-relative paths or https URLs (no javascript: or protocol-relative jumps).
        if (d.to && !isSafeRedirectTarget(d.to)) {
          throw new ValidationError({
            errors: [{ path: 'to', message: 'Use a path starting with / or an https URL' }],
            req,
          })
        }
        if (d.from && d.to && d.from === d.to) {
          throw new ValidationError({
            errors: [{ path: 'to', message: 'Redirect cannot point to itself' }],
            req,
          })
        }
        return data
      },
    ],
    // Drop the in-process redirect cache so edits apply on the next request (lib/redirects.ts).
    afterChange: [
      () => {
        invalidateRedirects()
      },
    ],
    afterDelete: [
      () => {
        invalidateRedirects()
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

/** Canned replies for the lead CRM. Placeholders: {{name}}, {{ref}}. */
export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  labels: { singular: 'Email template', plural: 'Email templates' },
  access: {
    create: allow('users.manage'),
    read: allow('enquiries.read'),
    update: allow('users.manage'),
    delete: allow('users.manage'),
  },
  admin: { useAsTitle: 'name' },
  hooks: { afterChange: [auditAfterChange] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'subject', type: 'text', required: true },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: { description: 'Use {{name}} and {{ref}}' },
    },
  ],
}

const own: Access = ({ req }) => (req.user ? { user: { equals: req.user.id } } : false)

/** In-admin bell. Written by server code; a user reads and marks only their own. */
export const Notifications: CollectionConfig = {
  slug: 'notifications',
  access: { create: () => false, read: own, update: own, delete: () => false },
  admin: { hidden: true },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'kind', type: 'text', required: true },
    { name: 'text', type: 'text', required: true },
    { name: 'link', type: 'text' },
    { name: 'read', type: 'checkbox', defaultValue: false },
  ],
}

/** Per-user saved filters for the leads table. */
export const SavedViews: CollectionConfig = {
  slug: 'saved-views',
  access: { create: ({ req }) => !!req.user, read: own, update: own, delete: own },
  admin: { hidden: true },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'query', type: 'text', required: true },
  ],
}

/** Missing paths seen by the site; feeds the redirect manager. Counts only, no visitor data. */
export const NotFoundLog: CollectionConfig = {
  slug: 'not-found-log',
  labels: { singular: '404 path', plural: '404 log' },
  access: {
    create: () => false,
    read: allow('redirects.manage'),
    update: () => false,
    delete: allow('redirects.manage'),
  },
  admin: { useAsTitle: 'path', defaultColumns: ['path', 'count', 'lastSeenAt'] },
  fields: [
    { name: 'path', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', defaultValue: 1 },
    { name: 'lastSeenAt', type: 'date' },
  ],
}

/** Successful sign-ins (time, IP, browser) for the security view. Administrators read. */
export const LoginHistory: CollectionConfig = {
  slug: 'login-history',
  access: {
    create: () => false,
    read: allow('users.manage'),
    update: () => false,
    delete: () => false,
  },
  admin: { defaultColumns: ['user', 'at', 'ip'] },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', index: true },
    { name: 'at', type: 'date', required: true },
    { name: 'ip', type: 'text' },
    { name: 'userAgent', type: 'text' },
  ],
}

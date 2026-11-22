import type { CollectionConfig } from 'payload'
import { allow, mfaSatisfied } from '../lib/access'
import { ROLES } from '../lib/roles'

const isProd = process.env.NODE_ENV === 'production'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: {
    // Lockout: 5 failed attempts locks the account for 10 minutes (SPEC §5.2).
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 2 * 60 * 60,
    cookies: { secure: isProd, sameSite: 'Lax' },
  },
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        await req.payload.create({
          collection: 'login-history',
          overrideAccess: true,
          req, // same transaction as the login, or the insert waits on the user row lock
          data: {
            user: (user as { id: number }).id,
            at: new Date().toISOString(),
            ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
            userAgent: (req.headers.get('user-agent') ?? '').slice(0, 200),
          },
        })
      },
    ],
  },
  access: {
    create: allow('users.manage'),
    // Staff see the full list only with MFA satisfied; everyone else sees only their own record.
    read: ({ req }) => {
      const u = req.user
      if (!u) return false
      if (u.role === 'administrator' && mfaSatisfied(req)) return true
      return { id: { equals: u.id } }
    },
    // Administrators manage any user; everyone else may update only their own record.
    update: ({ req }) => {
      const u = req.user
      if (!u) return false
      if (u.role === 'administrator') return true
      return { id: { equals: u.id } }
    },
    delete: allow('users.manage'),
    // Role decides who is a staff user; 2FA is opt-in, and once enabled it is required at sign-in (D10).
    admin: ({ req }) => !!req.user && mfaSatisfied(req),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'dashboardLayout',
      type: 'json',
      admin: {
        hidden: true,
        description: 'Saved dashboard widget order and visibility (per user)',
      },
      access: {
        read: ({ req, id }) => req.user?.id === id || req.user?.role === 'administrator',
        update: () => false,
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'content_editor',
      options: ROLES.map((r) => ({ label: r, value: r })),
      access: { update: ({ req }) => req.user?.role === 'administrator' },
    },
    {
      name: 'totp',
      type: 'group',
      admin: {
        description: 'MFA state. Secrets are encrypted and never readable through the API.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          saveToJWT: 'mfaOn', // JWT key read by proxy.ts to send users who enabled 2FA to the code screen
          access: { update: () => false },
        },
        {
          name: 'secret',
          type: 'text',
          access: { read: () => false, update: () => false },
          admin: { hidden: true },
        },
        {
          name: 'failedAttempts',
          type: 'number',
          defaultValue: 0,
          access: { read: () => false, update: () => false },
        },
        { name: 'lockedUntil', type: 'date', access: { read: () => false, update: () => false } },
        {
          name: 'recoveryCodes',
          type: 'array',
          access: { read: () => false, update: () => false },
          admin: { hidden: true },
          fields: [{ name: 'hash', type: 'text', required: true }],
        },
      ],
    },
    {
      // Shown on the user's own account page only (the component hides itself elsewhere).
      name: 'twoFactorSection',
      type: 'ui',
      admin: { components: { Field: '/components/admin/AccountMfa#AccountMfa' } },
    },
    { name: 'lastLoginAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'notifyByEmail',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Also email me bell notifications' },
    },
  ],
}

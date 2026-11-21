import type { CollectionConfig } from 'payload'

// Roles and MFA arrive in M3 (SPEC §5.2, D10).
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [],
}

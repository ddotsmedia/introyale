import type { GlobalConfig } from 'payload'
import { allow } from '../lib/access'
import { seoField } from '../fields/common'
import { layoutField } from '../blocks'

const readAll = () => true
const manage = allow('globals.manage')

// Contact details are referenced by Facts Register keys, never typed as free claims (SPEC §5.3).
const factRef = (name: string) => ({
  name,
  type: 'text' as const,
  admin: { description: 'Facts Register key' },
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: readAll, update: manage },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'footerLogo', type: 'upload', relationTo: 'media' },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'ctaLabel', type: 'text', localized: true },
    { name: 'ctaLink', type: 'text' },
  ],
}

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: { read: readAll, update: manage },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'link', type: 'text', required: true },
        {
          name: 'section',
          type: 'text',
          admin: { description: 'Hidden automatically when empty (SPEC §5.3)' },
        },
      ],
    },
  ],
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: { read: readAll, update: manage },
  fields: [
    { name: 'copy', type: 'textarea', localized: true },
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', localized: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true },
            { name: 'link', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true },
        { name: 'link', type: 'text' },
      ],
    },
  ],
}

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  access: { read: readAll, update: manage },
  fields: [
    factRef('addressFactKey'),
    factRef('phoneFactKey'),
    factRef('whatsappFactKey'),
    factRef('emailFactKey'),
    factRef('salesEmailFactKey'),
    { name: 'hours', type: 'text', localized: true },
    {
      name: 'geo',
      type: 'group',
      fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
      ],
    },
  ],
}

export const SocialProfiles: GlobalConfig = {
  slug: 'social-profiles',
  access: { read: readAll, update: manage },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}

export const SeoDefaults: GlobalConfig = {
  slug: 'seo-defaults',
  access: { read: readAll, update: manage },
  fields: [
    {
      name: 'titleTemplate',
      type: 'text',
      localized: true,
      defaultValue: '%s · Introyale Interiors',
    },
    { name: 'description', type: 'textarea', localized: true, maxLength: 160 },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
  ],
}

export const ConsultationSettings: GlobalConfig = {
  slug: 'consultation-settings',
  access: { read: readAll, update: manage },
  fields: [
    {
      name: 'budgetBands',
      type: 'array',
      admin: { description: 'Hidden until set (D12).' },
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'min', type: 'number' },
        { name: 'max', type: 'number' },
      ],
    },
    { name: 'slaText', type: 'text', localized: true },
    {
      name: 'routingRules',
      type: 'array',
      fields: [
        { name: 'sector', type: 'relationship', relationTo: 'sectors' },
        { name: 'assignee', type: 'relationship', relationTo: 'users' },
      ],
    },
  ],
}

export const LegalEntity: GlobalConfig = {
  slug: 'legal-entity',
  access: { read: readAll, update: manage },
  fields: [
    { name: 'legalName', type: 'text' },
    {
      name: 'licenceNumberFactKey',
      type: 'text',
      admin: { description: 'Facts Register key [CONFIRM]' },
    },
    { name: 'issuingAuthority', type: 'text' },
  ],
}

export const Integrations: GlobalConfig = {
  slug: 'integrations',
  access: { read: manage, update: manage },
  fields: [
    {
      name: 'featureFlags',
      type: 'group',
      fields: [
        { name: 'crm', type: 'checkbox', defaultValue: false },
        { name: 'cloudflare', type: 'checkbox', defaultValue: false },
        { name: 'umami', type: 'checkbox', defaultValue: true },
        { name: 'booking', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'secretNames',
      type: 'array',
      admin: { description: 'Names of Docker secrets only. Values never live in the database.' },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
  ],
}

/** Home page: reorderable, hideable blocks (NEXT-PROMPT part C). */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: { read: readAll, update: manage },
  fields: [layoutField, seoField],
}

export const globals: GlobalConfig[] = [
  SiteSettings,
  HomePage,
  Navigation,
  Footer,
  ContactInfo,
  SocialProfiles,
  SeoDefaults,
  ConsultationSettings,
  LegalEntity,
  Integrations,
]

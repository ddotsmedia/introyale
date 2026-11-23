import type { GlobalConfig } from 'payload'
import { allow } from '../lib/access'
import { seoField } from '../fields/common'
import { layoutField } from '../blocks'
import { FX, INTENSITIES } from '../lib/motionFx'

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
    {
      name: 'banner',
      type: 'group',
      admin: { description: 'Announcement or maintenance banner shown above the site header' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'info',
          options: ['info', 'maintenance'].map((v) => ({ label: v, value: v })),
        },
        { name: 'message', type: 'text', localized: true },
      ],
    },
    {
      name: 'adminLoginImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Hero image on the admin sign-in page' },
    },
    {
      name: 'closingCta',
      type: 'group',
      admin: { description: 'Closing call-to-action band used at the end of case studies' },
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'text', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'buttonLabel', type: 'text', localized: true },
        { name: 'buttonHref', type: 'text' },
      ],
    },
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
      name: 'showCredit',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show the developer credit in the footer',
    },
    { name: 'creditText', type: 'text', defaultValue: 'Built and managed by' },
    { name: 'creditName', type: 'text', defaultValue: 'Ddotsmedia Technologies LLC' },
    { name: 'creditUrl', type: 'text', defaultValue: 'https://ddotsmedia.com' },
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
      name: 'crm',
      type: 'group',
      admin: { description: 'Targets and pipeline weights used by the admin dashboard' },
      fields: [
        {
          name: 'monthlyLeadGoal',
          type: 'number',
          min: 0,
          admin: { description: 'Enquiries per month' },
        },
        {
          name: 'slaHours',
          type: 'number',
          min: 1,
          defaultValue: 4,
          admin: { description: 'First response target, business hours' },
        },
        {
          name: 'probNew',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 10,
          admin: { description: 'Win probability %' },
        },
        { name: 'probContacted', type: 'number', min: 0, max: 100, defaultValue: 25 },
        { name: 'probSiteVisit', type: 'number', min: 0, max: 100, defaultValue: 50 },
        { name: 'probProposal', type: 'number', min: 0, max: 100, defaultValue: 70 },
      ],
    },
    {
      name: 'consentText',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Label for the consent checkbox on the contact and consultation forms',
      },
    },
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
      name: 'lastRestoreDrill',
      type: 'date',
      admin: { description: 'Date of the last backup restore drill' },
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

/** Motion settings: master switch, intensity and one switch per effect. Read on every request, no rebuild needed. */
export const MotionSettings: GlobalConfig = {
  slug: 'motion-settings',
  label: 'Motion settings',
  access: { read: readAll, update: manage },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Master switch. Off shows the static site: all content, no animation.',
      },
    },
    {
      name: 'intensity',
      type: 'select',
      defaultValue: 'standard',
      options: INTENSITIES.map((v) => ({ label: v, value: v })),
    },
    {
      name: 'heroSlides',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 5,
      admin: {
        description:
          'Extra images for the home hero slideshow (3 to 5 in total with the hero image). Empty shows the single hero image.',
      },
    },
    {
      name: 'slideSeconds',
      type: 'number',
      defaultValue: 7,
      min: 4,
      max: 12,
      admin: { description: 'Seconds each hero slide stays' },
    },
    {
      name: 'effects',
      type: 'group',
      admin: { description: 'Turn individual effects on or off' },
      fields: FX.map(([name, label]) => ({
        name,
        type: 'checkbox' as const,
        label,
        defaultValue: true,
      })),
    },
  ],
}

export const globals: GlobalConfig[] = [
  SiteSettings,
  HomePage,
  MotionSettings,
  Navigation,
  Footer,
  ContactInfo,
  SocialProfiles,
  SeoDefaults,
  ConsultationSettings,
  LegalEntity,
  Integrations,
]

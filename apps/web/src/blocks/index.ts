import type { Block, Field } from 'payload'

// Page blocks (NEXT-PROMPT part C): every piece of page content is a CMS field, so editors can reorder,
// edit and hide sections in /admin. Components only render what these blocks carry.

const text = (name: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: 'text', localized: true, ...extra }) as Field
const area = (name: string): Field => ({ name, type: 'textarea', localized: true })
const media = (name: string): Field => ({ name, type: 'upload', relationTo: 'media' })
const link = (name: string): Field => ({
  name,
  type: 'group',
  fields: [
    { name: 'label', type: 'text', localized: true },
    { name: 'href', type: 'text', admin: { description: 'Path such as /start, or a full URL' } },
  ],
})
const hidden: Field = {
  name: 'hidden',
  type: 'checkbox',
  defaultValue: false,
  admin: { description: 'Hide this block on the site without deleting it' },
}

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    text('eyebrow'),
    text('headline', { required: true }),
    area('subhead'),
    media('image'),
    {
      name: 'overlay',
      type: 'number',
      defaultValue: 45,
      min: 0,
      max: 80,
      admin: { description: 'Darkness of the image overlay, 0–80' },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full screen', value: 'full' },
        { label: 'Page banner', value: 'banner' },
      ],
    },
    link('primaryCta'),
    link('secondaryCta'),
    hidden,
  ],
}

export const IntroStatsBlock: Block = {
  slug: 'introStats',
  labels: { singular: 'Intro and stats', plural: 'Intro and stats' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('body'),
    link('cta'),
    {
      name: 'stats',
      type: 'array',
      maxRows: 6,
      admin: { description: 'Each number comes from a verified fact in the Facts Register' },
      fields: [
        {
          name: 'factKey',
          type: 'text',
          required: true,
          admin: { description: 'Facts Register key' },
        },
        text('label'),
      ],
    },
    hidden,
  ],
}

export const FeaturedWorkBlock: Block = {
  slug: 'featuredWork',
  labels: { singular: 'Featured work', plural: 'Featured work' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('intro'),
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { description: 'Pick projects. Leave empty to show the latest published ones' },
    },
    { name: 'limit', type: 'number', defaultValue: 5, min: 1, max: 12 },
    link('viewAll'),
    hidden,
  ],
}

export const SectorTilesBlock: Block = {
  slug: 'sectorTiles',
  labels: { singular: 'Sector tiles', plural: 'Sector tiles' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('intro'),
    {
      name: 'sectors',
      type: 'relationship',
      relationTo: 'sectors',
      hasMany: true,
      admin: { description: 'Leave empty to show every published sector' },
    },
    hidden,
  ],
}

export const ServicesListBlock: Block = {
  slug: 'servicesList',
  labels: { singular: 'Services list', plural: 'Services lists' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('intro'),
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: { description: 'Leave empty to show every published service' },
    },
    link('viewAll'),
    hidden,
  ],
}

export const ProcessStepsBlock: Block = {
  slug: 'processSteps',
  labels: { singular: 'Process steps', plural: 'Process steps' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('intro'),
    {
      name: 'steps',
      type: 'array',
      fields: [text('title', { required: true }), area('body')],
    },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
    },
    hidden,
  ],
}

export const ClientWallBlock: Block = {
  slug: 'clientWall',
  labels: { singular: 'Client logos', plural: 'Client logos' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('intro'),
    {
      name: 'clients',
      type: 'relationship',
      relationTo: 'clients',
      hasMany: true,
      admin: { description: 'Leave empty to show every client with logo permission' },
    },
    { name: 'limit', type: 'number', defaultValue: 12, min: 1, max: 60 },
    link('viewAll'),
    hidden,
  ],
}

export const CtaBandBlock: Block = {
  slug: 'ctaBand',
  labels: { singular: 'Call-to-action band', plural: 'Call-to-action bands' },
  fields: [
    text('heading', { required: true }),
    area('text'),
    media('image'),
    link('button'),
    hidden,
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: 'Image and text', plural: 'Image and text' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('body'),
    media('image'),
    {
      name: 'imageSide',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Image on the right', value: 'right' },
        { label: 'Image on the left', value: 'left' },
      ],
    },
    link('cta'),
    hidden,
  ],
}

export const TextSectionBlock: Block = {
  slug: 'textSection',
  labels: { singular: 'Text section', plural: 'Text sections' },
  fields: [
    text('eyebrow'),
    text('heading'),
    area('body'),
    {
      name: 'columns',
      type: 'select',
      defaultValue: '1',
      options: [
        { label: 'One column', value: '1' },
        { label: 'Two columns', value: '2' },
      ],
    },
    hidden,
  ],
}

export const ContactInfoBlock: Block = {
  slug: 'contactInfo',
  labels: { singular: 'Contact details', plural: 'Contact details' },
  fields: [
    text('heading'),
    area('intro'),
    { name: 'showHours', type: 'checkbox', defaultValue: true },
    hidden,
  ],
}

export const EnquiryFormBlock: Block = {
  slug: 'enquiryForm',
  labels: { singular: 'Enquiry form', plural: 'Enquiry forms' },
  fields: [
    text('heading'),
    area('intro'),
    {
      name: 'form',
      type: 'select',
      defaultValue: 'contact',
      options: [
        { label: 'Contact form', value: 'contact' },
        { label: 'Consultation request (multi-step)', value: 'consultation' },
      ],
    },
    hidden,
  ],
}

export const pageBlocks: Block[] = [
  HeroBlock,
  IntroStatsBlock,
  FeaturedWorkBlock,
  SectorTilesBlock,
  ServicesListBlock,
  ProcessStepsBlock,
  ClientWallBlock,
  CtaBandBlock,
  ImageTextBlock,
  TextSectionBlock,
  ContactInfoBlock,
  EnquiryFormBlock,
]

/** Reorderable block layout for a page, sector or service. */
export const layoutField: Field = {
  name: 'layout',
  type: 'blocks',
  labels: { singular: 'Section', plural: 'Sections' },
  blocks: pageBlocks,
  admin: {
    description: 'Add, reorder, edit or hide sections. Changes appear on the site after publishing',
  },
}

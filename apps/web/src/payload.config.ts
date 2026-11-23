import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Sectors, PropertyTypes, Services, Projects, Faqs, Pages } from './collections/content'
import { TeamMembers, Testimonials, Clients, Awards } from './collections/people'
import { JournalPosts, JournalCategories } from './collections/journal'
import {
  Facts,
  Enquiries,
  Redirects,
  AuditLog,
  RateLimits,
  EmailTemplates,
  Notifications,
  SavedViews,
  NotFoundLog,
  LoginHistory,
} from './collections/system'
import { jobTasks } from './jobs/tasks'
import { globals } from './globals'
import { readSecret } from './lib/secrets'
import { signPreview } from './lib/previewToken'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Sidebar groups are drawn by the custom Nav (src/admin/components/Nav.tsx); GROUPS only organises the collections Payload would list.
const GROUPS: Record<string, string> = {
  enquiries: 'Leads',
  'email-templates': 'Leads',
  pages: 'Content',
  sectors: 'Content',
  services: 'Content',
  'property-types': 'Content',
  faqs: 'Content',
  'journal-posts': 'Content',
  'journal-categories': 'Content',
  'team-members': 'Content',
  testimonials: 'Content',
  clients: 'Content',
  awards: 'Content',
  projects: 'Projects',
  media: 'Media',
  facts: 'Site',
  redirects: 'Site',
  'not-found-log': 'Site',
  users: 'System',
  'audit-log': 'System',
  'login-history': 'System',
}
const grouped = <T extends { slug: string; admin?: Record<string, unknown> }>(list: T[]): T[] =>
  list.map((c) => ({ ...c, admin: { ...c.admin, group: GROUPS[c.slug] ?? c.admin?.group } }))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' | Introyale Studio',
      icons: [
        {
          rel: 'icon',
          url: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%226%22 fill=%22%231f1d1a%22/%3E%3Ctext x=%2216%22 y=%2223%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23c9a37a%22 font-family=%22Georgia%22%3EI%3C/text%3E%3C/svg%3E',
        },
      ],
    },
    livePreview: {
      collections: ['pages', 'projects'],
      globals: ['home-page'],
      // Signed, short-lived link to the draft preview route; the page refreshes when the document is saved.
      url: ({ data, collectionConfig }) => {
        const c =
          collectionConfig?.slug === 'projects'
            ? 'projects'
            : collectionConfig
              ? 'pages'
              : 'home-page'
        const id = typeof data.id === 'number' ? data.id : 0
        return `/preview/${signPreview({ c, id, exp: Date.now() + 24 * 3_600_000 }, readSecret('PAYLOAD_SECRET'))}`
      },
    },
    avatar: { Component: '/admin/components/Avatar#Avatar' },
    components: {
      graphics: {
        Logo: '/admin/components/Branding#Logo',
        Icon: '/admin/components/Branding#Icon',
      },
      beforeLogin: ['/admin/components/Branding#BeforeLogin'],
      providers: ['/admin/components/CommandPalette#CommandPalette'],
      Nav: '/admin/components/Nav#Nav',
      actions: ['/admin/components/TopActions#TopActions', '/admin/components/Branding#Bell'],
      views: {
        dashboard: { Component: '/admin/views/Dashboard#Dashboard' },
        leadsBoard: { Component: '/admin/views/LeadsBoard#LeadsBoard', path: '/leads-board' },
        leadsTable: { Component: '/admin/views/LeadsTable#LeadsTable', path: '/leads' },
        leadDetail: { Component: '/admin/views/LeadDetail#LeadDetail', path: '/lead' },
        analytics: { Component: '/admin/views/Analytics#Analytics', path: '/analytics' },
        calendar: { Component: '/admin/views/Calendar#Calendar', path: '/calendar' },
        workflow: { Component: '/admin/views/Workflow#Workflow', path: '/workflow' },
        contentHealth: {
          Component: '/admin/views/ContentHealth#ContentHealth',
          path: '/content-health',
        },
        mediaLibrary: {
          Component: '/admin/views/MediaLibrary#MediaLibrary',
          path: '/media-library',
        },
        siteTools: { Component: '/admin/views/SiteTools#SiteTools', path: '/site-tools' },
        system: { Component: '/admin/views/System#System', path: '/system' },
        security: { Component: '/admin/views/Security#Security', path: '/security' },
        audit: { Component: '/admin/views/Audit#Audit', path: '/audit' },
      },
    },
  },
  collections: grouped([
    Users,
    Media,
    Projects,
    Services,
    Sectors,
    PropertyTypes,
    TeamMembers,
    Testimonials,
    Clients,
    Awards,
    JournalPosts,
    JournalCategories,
    Faqs,
    Pages,
    Facts,
    Enquiries,
    Redirects,
    AuditLog,
    RateLimits,
    EmailTemplates,
    Notifications,
    SavedViews,
    NotFoundLog,
    LoginHistory,
  ]),
  i18n: { supportedLanguages: { en, ar } },
  jobs: { tasks: jobTasks },
  globals: grouped(globals),
  editor: lexicalEditor(),
  secret: readSecret('PAYLOAD_SECRET'),
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Arabic', code: 'ar' },
    ],
    defaultLocale: 'en',
    fallback: false,
  },
  // No GraphQL surface: enquiries must never leak through it (SPEC §5.2).
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: readSecret('DATABASE_URL') },
    prodMigrations: migrations,
  }),
  sharp,
})

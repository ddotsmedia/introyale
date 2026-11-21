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
import { Facts, Enquiries, Redirects, AuditLog, RateLimits } from './collections/system'
import { jobTasks } from './jobs/tasks'
import { globals } from './globals'
import { readSecret } from './lib/secrets'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [
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
  ],
  jobs: { tasks: jobTasks },
  globals,
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

import config from '@payload-config'
import { getPayload } from 'payload'
import type { ServerProps } from 'payload'
import { can, type Action, type Role } from '../../lib/roles'
import { Sidebar, type NavGroup } from './Sidebar'

type Def = {
  href: string
  label: string
  icon: string
  need?: Action
  exact?: boolean
  slug?: string
}

const c = (slug: string, label: string, icon: string, need?: Action): Def => ({
  href: `/admin/collections/${slug}`,
  label,
  icon,
  need,
  slug,
})
const g = (slug: string, label: string, icon: string, need: Action = 'globals.manage'): Def => ({
  href: `/admin/globals/${slug}`,
  label,
  icon,
  need,
  slug,
})

const GROUPS: { name: string; items: Def[] }[] = [
  {
    name: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
      { href: '/admin/analytics', label: 'Analytics', icon: 'analytics', need: 'analytics.view' },
    ],
  },
  {
    name: 'Leads',
    items: [
      { href: '/admin/leads-board', label: 'Board', icon: 'board', need: 'enquiries.read' },
      { href: '/admin/leads', label: 'Table', icon: 'table', need: 'enquiries.read' },
      {
        href: '/admin/calendar',
        label: 'Calendar & tasks',
        icon: 'calendar',
        need: 'enquiries.read',
      },
    ],
  },
  {
    name: 'Content',
    items: [
      c('pages', 'Pages', 'pages', 'content.write'),
      g('home-page', 'Home page', 'home', 'content.write'),
      c('projects', 'Projects', 'projects', 'project.write'),
      c('services', 'Services', 'services', 'content.write'),
      c('sectors', 'Sectors', 'sectors', 'content.write'),
      c('journal-posts', 'Journal', 'journal', 'content.write'),
      c('team-members', 'Team', 'team', 'content.write'),
      c('testimonials', 'Testimonials', 'testimonials', 'content.write'),
      c('clients', 'Clients', 'clients', 'content.write'),
      c('faqs', 'FAQs', 'faq', 'content.write'),
      { href: '/admin/media-library', label: 'Media', icon: 'media', need: 'comment' },
    ],
  },
  {
    name: 'Publishing',
    items: [
      { href: '/admin/workflow', label: 'Workflow board', icon: 'workflow', need: 'comment' },
      {
        href: '/admin/content-health',
        label: 'Content health',
        icon: 'health',
        need: 'content.health',
      },
    ],
  },
  {
    name: 'Settings',
    items: [
      g('site-settings', 'Site', 'site'),
      g('navigation', 'Navigation', 'navigation'),
      g('footer', 'Footer', 'footer'),
      g('contact-info', 'Contact info', 'contact'),
      g('social-profiles', 'Social', 'social'),
      g('seo-defaults', 'SEO defaults', 'seo'),
      g('consultation-settings', 'Consultation', 'consultation'),
      g('legal-entity', 'Legal entity', 'legal'),
      g('motion-settings', 'Motion', 'motion'),
      g('integrations', 'Integrations', 'integrations'),
      {
        href: '/admin/site-tools',
        label: 'Redirects & 404s',
        icon: 'redirects',
        need: 'redirects.manage',
      },
    ],
  },
  {
    name: 'System',
    items: [
      { href: '/admin/system', label: 'System status', icon: 'system', need: 'system.view' },
      {
        href: '/admin/security',
        label: 'Users & security',
        icon: 'security',
        need: 'users.manage',
      },
      { href: '/admin/audit', label: 'Audit log', icon: 'audit', need: 'users.manage' },
    ],
  },
]

type Ref = { url?: string | null } | number | null | undefined
const REVIEW = [
  'projects',
  'services',
  'sectors',
  'pages',
  'journal-posts',
  'team-members',
  'testimonials',
] as const

/** The single admin sidebar (replaces Payload's default collection and global lists). */
export async function Nav(props: ServerProps) {
  const user = props.user as unknown as { name?: string; role?: Role } | null
  if (!user) return null
  const role = user.role
  const payload = await getPayload({ config })
  const [logo, leads, review] = await Promise.all([
    payload
      .findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: true })
      .then((s) => {
        const l = (s as unknown as { logo?: Ref }).logo
        return l && typeof l === 'object' ? (l.url ?? null) : null
      })
      .catch(() => null),
    can(role, 'enquiries.read')
      ? payload
          .count({
            collection: 'enquiries',
            where: { status: { equals: 'new' } },
            overrideAccess: true,
          })
          .then((r) => r.totalDocs)
          .catch(() => 0)
      : 0,
    can(role, 'workflow.approve') || can(role, 'workflow.publish')
      ? Promise.all(
          REVIEW.map((col) =>
            payload
              .count({
                collection: col,
                where: { 'workflow.status': { equals: 'in_review' } },
                overrideAccess: true,
              })
              .then((r) => r.totalDocs)
              .catch(() => 0),
          ),
        ).then((a) => a.reduce((x, y) => x + y, 0))
      : 0,
  ])
  const visible = props.visibleEntities as
    { collections?: string[]; globals?: string[] } | undefined
  const groups: NavGroup[] = GROUPS.map((grp) => ({
    name: grp.name,
    items: grp.items
      .filter((i) => !i.need || can(role, i.need))
      .filter((i) => {
        if (!i.slug) return true
        const list = i.href.includes('/globals/') ? visible?.globals : visible?.collections
        return !list || list.includes(i.slug)
      })
      .map((i) => ({
        href: i.href,
        label: i.label,
        icon: i.icon,
        exact: i.exact,
        badge: i.href === '/admin/leads-board' ? leads : i.href === '/admin/workflow' ? review : 0,
      })),
  })).filter((grp) => grp.items.length)
  return (
    <Sidebar groups={groups} user={{ name: user.name ?? 'Staff', role: role ?? '' }} logo={logo} />
  )
}

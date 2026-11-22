import { session } from '@/admin/session'
import { can, type Action } from '@/lib/roles'

export const dynamic = 'force-dynamic'

type Hit = { type: string; label: string; href: string }

const PAGES: { label: string; href: string; need?: Action; kw?: string }[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Analytics', href: '/admin/analytics', need: 'analytics.view', kw: 'traffic visitors' },
  {
    label: 'Leads board',
    href: '/admin/leads-board',
    need: 'enquiries.read',
    kw: 'enquiries pipeline',
  },
  { label: 'Leads table', href: '/admin/leads', need: 'enquiries.read', kw: 'enquiries' },
  {
    label: 'Calendar: follow-ups and site visits',
    href: '/admin/calendar',
    need: 'enquiries.read',
    kw: 'tasks reminders',
  },
  { label: 'Workflow board', href: '/admin/workflow', need: 'comment', kw: 'review approve' },
  { label: 'Content health', href: '/admin/content-health', need: 'content.health', kw: 'seo' },
  { label: 'Media library', href: '/admin/media-library', need: 'comment', kw: 'images' },
  { label: 'Redirects, 404s, integrations', href: '/admin/site-tools', need: 'redirects.manage' },
  { label: 'System status', href: '/admin/system', need: 'system.view', kw: 'backup health' },
  { label: 'Users and security', href: '/admin/security', need: 'users.manage', kw: 'mfa roles' },
  { label: 'Audit log', href: '/admin/audit', need: 'users.manage' },
  { label: 'Site settings', href: '/admin/globals/site-settings', need: 'globals.manage' },
  {
    label: 'Consultation settings (goal, SLA, pipeline weights)',
    href: '/admin/globals/consultation-settings',
    need: 'globals.manage',
    kw: 'sla goal',
  },
  { label: 'Navigation', href: '/admin/globals/navigation', need: 'globals.manage', kw: 'menu' },
  { label: 'Footer', href: '/admin/globals/footer', need: 'globals.manage' },
  {
    label: 'Contact information',
    href: '/admin/globals/contact-info',
    need: 'globals.manage',
    kw: 'phone email address',
  },
  { label: 'SEO defaults', href: '/admin/globals/seo-defaults', need: 'globals.manage' },
  { label: 'Home page', href: '/admin/globals/home-page', need: 'content.write' },
  {
    label: 'Motion settings',
    href: '/admin/globals/motion-settings',
    need: 'globals.manage',
    kw: 'animation',
  },
]
const ACTIONS: { label: string; href: string; need: Action }[] = [
  { label: 'New project', href: '/admin/collections/projects/create', need: 'project.write' },
  {
    label: 'New journal post',
    href: '/admin/collections/journal-posts/create',
    need: 'content.write',
  },
  { label: 'New page', href: '/admin/collections/pages/create', need: 'content.write' },
  { label: 'Upload media', href: '/admin/collections/media/create', need: 'media.write' },
  { label: 'New redirect', href: '/admin/collections/redirects/create', need: 'redirects.manage' },
]

/** Command palette backend: role-filtered quick actions and pages, plus a permission-checked search of leads and content. */
export async function GET(req: Request): Promise<Response> {
  try {
    const { payload, user, req: authReq } = await session()
    const q = (new URL(req.url).searchParams.get('q') ?? '').trim().slice(0, 80)
    const allowed = (x: { need?: Action }) => !x.need || can(user.role, x.need)
    const hits: Hit[] = []
    const needle = q.toLowerCase()
    for (const a of ACTIONS.filter(allowed)) {
      if (!needle || a.label.toLowerCase().includes(needle))
        hits.push({ type: 'Action', label: a.label, href: a.href })
    }
    for (const p of PAGES.filter(allowed)) {
      if (!needle || `${p.label} ${p.kw ?? ''}`.toLowerCase().includes(needle))
        hits.push({ type: 'Go to', label: p.label, href: p.href })
    }
    if (q.length >= 2) {
      const content = async (
        collection: 'projects' | 'services' | 'pages' | 'journal-posts',
        type: string,
      ) => {
        const r = await payload.find({
          collection,
          req: authReq,
          overrideAccess: false,
          depth: 0,
          limit: 4,
          where: { title: { like: q } },
          select: { title: true },
        })
        return (r.docs as unknown as { id: number; title?: string }[]).map((d) => ({
          type,
          label: d.title ?? String(d.id),
          href: `/admin/collections/${collection}/${String(d.id)}`,
        }))
      }
      const lead = can(user.role, 'enquiries.read')
        ? payload
            .find({
              collection: 'enquiries',
              req: authReq,
              overrideAccess: false,
              depth: 0,
              limit: 5,
              where: { or: [{ name: { like: q } }, { email: { like: q } }, { ref: { like: q } }] },
              select: { ref: true, name: true },
            })
            .then((r) =>
              (r.docs as unknown as { id: number; ref: string; name?: string }[]).map((d) => ({
                type: 'Lead',
                label: `${d.ref} ${d.name ?? ''}`.trim(),
                href: `/admin/lead?id=${String(d.id)}`,
              })),
            )
        : Promise.resolve([])
      const found = await Promise.all([
        lead,
        content('projects', 'Project').catch(() => []),
        content('services', 'Service').catch(() => []),
        content('pages', 'Page').catch(() => []),
        content('journal-posts', 'Journal').catch(() => []),
      ])
      hits.unshift(...found.flat())
    }
    return Response.json({ hits: hits.slice(0, 14) }, { headers: { 'cache-control': 'no-store' } })
  } catch {
    return new Response('Forbidden', { status: 403 })
  }
}

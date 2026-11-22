import { cms } from '@/lib/cms'
import { BeforeAfter } from '../BeforeAfter'
import { container, SectionHeading, sectionPad, type BlockOf } from './shared'

/** Home spotlight for one project's before/after images. Shows nothing when no project has them (never invents content). */
export async function BeforeAfterSpotlight({ block }: { block: BlockOf<'beforeAfterSpotlight'> }) {
  let project = typeof block.project === 'object' ? block.project : null
  if (!project?.beforeAfter?.length) {
    const payload = await cms()
    const res = await payload.find({
      collection: 'projects',
      where: { 'workflow.status': { equals: 'published' } },
      sort: 'createdAt',
      limit: 50,
      depth: 2,
      overrideAccess: false,
    })
    project = res.docs.find((p) => (p.beforeAfter ?? []).length > 0) ?? null
  }
  const pair = project?.beforeAfter?.[0]
  if (!project || !pair) return null
  return (
    <section className={`${sectionPad} bg-sand`}>
      <div className={`${container} grid items-center gap-6 md:grid-cols-12 md:gap-10`}>
        <div className="reveal md:col-span-4">
          <SectionHeading eyebrow={block.eyebrow} heading={block.heading ?? project.title} />
        </div>
        <div className="md:col-span-8">
          <BeforeAfter before={pair.before} after={pair.after} caption={pair.caption} />
        </div>
      </div>
    </section>
  )
}

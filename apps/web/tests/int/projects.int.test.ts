import { randomUUID } from 'node:crypto'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, describe, expect, it } from 'vitest'
import config from '@payload-config'
import { projectWhere } from '../../src/lib/projectFilters'

// DB-backed filter correctness (SPEC §7 M6). Enabled only when INT_DB=1.
const enabled = process.env.INT_DB === '1'
const suffix = randomUUID().slice(0, 8)
// Unique years per run so earlier runs' fixtures never match these assertions.
const yearA = 2000 + Math.floor(Math.random() * 500)
const yearB = yearA + 500

describe.runIf(enabled)('projects explorer filters (M6)', () => {
  let payload: Payload
  let admin: Awaited<ReturnType<Payload['findByID']>>
  const sectorSlug = `it-sector-${suffix}`
  const otherSlug = `it-other-${suffix}`

  const png = async (): Promise<string> => {
    const dir = mkdtempSync(path.join(tmpdir(), 'introyale-'))
    const file = path.join(dir, `hero-${suffix}.png`)
    writeFileSync(
      file,
      await sharp({ create: { width: 2000, height: 1500, channels: 3, background: '#EFE8DD' } })
        .png()
        .toBuffer(),
    )
    return file
  }

  const publishProject = async (slug: string, sector: number, year: number) => {
    const media = await payload.create({
      collection: 'media',
      filePath: await png(),
      data: { alt: 'Test hero', usageApproved: true },
      overrideAccess: true,
    })
    let p = await payload.create({
      collection: 'projects',
      data: {
        title: `Project ${slug}`,
        slug,
        sector,
        areaLabel: 'District',
        year,
        hero: media.id,
        clientApproval: { approved: true },
        seo: { metaTitle: 'Project', metaDescription: 'Project summary' },
        workflow: { status: 'draft' },
      },
      overrideAccess: true,
    })
    for (const status of ['in_review', 'approved', 'published'] as const) {
      p = await payload.update({
        collection: 'projects',
        id: p.id,
        data: { workflow: { status } },
        user: admin,
        overrideAccess: true,
      })
    }
    return p
  }

  beforeAll(async () => {
    payload = await getPayload({ config })
    admin = await payload.create({
      collection: 'users',
      data: {
        email: `admin-${suffix}@test.invalid`,
        password: `pw-${randomUUID()}`,
        name: 'Admin',
        role: 'administrator',
      },
      overrideAccess: true,
    })
    const sectorA = await payload.create({
      collection: 'sectors',
      data: { title: 'IT sector', slug: sectorSlug, workflow: { status: 'draft' } },
      overrideAccess: true,
    })
    const sectorB = await payload.create({
      collection: 'sectors',
      data: { title: 'IT other', slug: otherSlug, workflow: { status: 'draft' } },
      overrideAccess: true,
    })
    await publishProject(`it-a-${suffix}`, sectorA.id, yearA)
    await publishProject(`it-b-${suffix}`, sectorB.id, yearB)
  })

  it('uploads produce AVIF and WebP variants (SPEC §5.2)', async () => {
    const media = await payload.create({
      collection: 'media',
      filePath: await png(),
      data: { alt: 'Variant check', usageApproved: true },
      overrideAccess: true,
    })
    const sizes = media.sizes as Record<string, { url?: string | null } | undefined>
    expect(sizes.a480?.url).toBeTruthy()
    expect(sizes.w1920?.url).toBeTruthy()
  })

  it('a sector filter returns only projects in that sector', async () => {
    const res = await payload.find({
      collection: 'projects',
      where: projectWhere({ sector: sectorSlug }),
      overrideAccess: true,
    })
    expect(res.docs.map((d) => d.slug)).toEqual([`it-a-${suffix}`])
  })

  it('a year filter returns only projects from that year', async () => {
    const res = await payload.find({
      collection: 'projects',
      where: projectWhere({ year: String(yearB) }),
      overrideAccess: true,
    })
    expect(res.docs.map((d) => d.slug)).toEqual([`it-b-${suffix}`])
  })

  it('combined filters narrow the result, and unmatched combinations are empty', async () => {
    const res = await payload.find({
      collection: 'projects',
      where: projectWhere({ sector: sectorSlug, year: String(yearB) }),
      overrideAccess: true,
    })
    expect(res.totalDocs).toBe(0)
  })

  it('anonymous visitors never see unpublished projects', async () => {
    const draft = await payload.create({
      collection: 'projects',
      data: {
        title: 'Draft only',
        slug: `it-draft-${suffix}`,
        areaLabel: 'District',
        year: yearA,
        workflow: { status: 'draft' },
      } as never,
      overrideAccess: true,
    })
    const res = await payload.find({
      collection: 'projects',
      where: projectWhere({ year: String(yearA) }),
      overrideAccess: false,
    })
    expect(res.docs.find((d) => d.id === draft.id)).toBeUndefined()
  })
})

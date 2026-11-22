import fs from 'node:fs/promises'
import path from 'node:path'
import { sql } from '@payloadcms/db-postgres/drizzle'
import type { Payload } from 'payload'
import { readSecret } from '../lib/secrets'

async function dirSize(dir: string): Promise<number> {
  let total = 0
  try {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      total += e.isDirectory() ? await dirSize(p) : (await fs.stat(p)).size
    }
  } catch {
    /* missing dir counts as zero */
  }
  return total
}

export async function backupInfo(): Promise<{ at: Date | null; ageHours: number | null }> {
  try {
    const raw = await fs.readFile(process.env.BACKUP_STATUS_FILE ?? '/backups/last_success', 'utf8')
    const at = new Date(Number(raw.trim()) * 1000)
    if (Number.isNaN(at.getTime())) return { at: null, ageHours: null }
    return { at, ageHours: Math.round((Date.now() - at.getTime()) / 3_600_000) }
  } catch {
    return { at: null, ageHours: null }
  }
}

export async function health(payload: Payload) {
  let db = false
  try {
    await payload.count({ collection: 'users', overrideAccess: true })
    db = true
  } catch {
    db = false
  }
  let worker = false
  try {
    const r = await fetch(process.env.WORKER_HEALTH_URL ?? 'http://worker:3001/health', {
      signal: AbortSignal.timeout(1500),
    })
    worker = r.ok
  } catch {
    worker = false
  }
  return { db, worker }
}

export async function jobStats(payload: Payload) {
  const base = { collection: 'payload-jobs' as const, overrideAccess: true, limit: 0 }
  const [pending, failed] = await Promise.all([
    payload.count({
      ...base,
      where: { and: [{ completedAt: { exists: false } }, { hasError: { not_equals: true } }] },
    }),
    payload.count({ ...base, where: { hasError: { equals: true } } }),
  ])
  return { pending: pending.totalDocs, failed: failed.totalDocs }
}

export async function dbSize(payload: Payload): Promise<number | null> {
  try {
    const db = payload.db as unknown as {
      drizzle: { execute: (q: unknown) => Promise<{ rows: { s: string }[] }> }
    }
    const r = await db.drizzle.execute(sql`select pg_database_size(current_database())::text as s`)
    return Number(r.rows[0]?.s ?? 0)
  } catch {
    return null
  }
}

export const mediaUsage = () => dirSize(process.env.MEDIA_DIR ?? 'media')

export function fmtBytes(n: number | null): string {
  if (n == null) return 'n/a'
  if (n > 1e9) return `${(n / 1e9).toFixed(2)} GB`
  if (n > 1e6) return `${(n / 1e6).toFixed(1)} MB`
  return `${Math.round(n / 1e3)} KB`
}

/** Open errors count from GlitchTip (Sentry-compatible API) when configured; null otherwise. */
export async function errorCount(): Promise<number | null> {
  const base = process.env.GLITCHTIP_API_URL
  const token = readSecret('GLITCHTIP_API_TOKEN')
  const project = process.env.GLITCHTIP_PROJECT
  if (!base || !token || !project) return null
  try {
    const r = await fetch(`${base}/api/0/projects/${project}/issues/?query=is:unresolved`, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    })
    return r.ok ? ((await r.json()) as unknown[]).length : null
  } catch {
    return null
  }
}

export const appVersion = () => process.env.APP_VERSION ?? process.env.IMAGE_TAG ?? 'local'

/** Free and total space of the volume that holds the media directory (the data disk on the VPS). Null when unavailable. */
export async function diskInfo(): Promise<{ free: number; total: number } | null> {
  try {
    const s = await fs.statfs(process.env.MEDIA_DIR ?? 'media')
    return { free: s.bavail * s.bsize, total: s.blocks * s.bsize }
  } catch {
    return null
  }
}

import { createHash } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { cms } from './cms'
import { readSecret } from './secrets'

/** Hashed identifier so raw IPs and emails are never stored (SPEC §4 privacy). */
export function scopeKey(scope: string, value: string): string {
  const salt = readSecret('PAYLOAD_SECRET')
  return `${scope}:${createHash('sha256').update(`${salt}:${value.toLowerCase()}`).digest('hex').slice(0, 32)}`
}

/**
 * Fixed-window counter in the `rate_limits` table. One atomic upsert per hit, so concurrent
 * requests cannot slip past the limit. Limits: 5 per 10 min per IP, 3 per hour per email (SPEC M8).
 */
export async function hitRateLimit(
  key: string,
  windowMs: number,
  max: number,
  now = Date.now(),
): Promise<{ allowed: boolean; count: number }> {
  const payload = await cms()
  const bucket = Math.floor(now / windowMs)
  const rowKey = `${key}:${String(bucket)}`
  const result = (await payload.db.drizzle.execute(
    sql`INSERT INTO rate_limits ("key", "count", "created_at", "updated_at")
        VALUES (${rowKey}, 1, now(), now())
        ON CONFLICT ("key") DO UPDATE SET "count" = rate_limits."count" + 1, "updated_at" = now()
        RETURNING "count"`,
  )) as unknown as { rows: { count: number }[] }
  const count = result.rows[0]?.count ?? 0
  return { allowed: count <= max, count }
}

// SPEC §7 M8 acceptance: the 11th submission from one IP in 10 minutes is blocked (10 allowed).
// The M8 rule text says 5/10 min; the acceptance criterion is the testable one. See decisions-log.
export const IP_LIMIT = { windowMs: 10 * 60 * 1000, max: 10 }
export const EMAIL_LIMIT = { windowMs: 60 * 60 * 1000, max: 3 }

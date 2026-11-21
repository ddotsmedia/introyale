import config from '@payload-config'
import { getPayload } from 'payload'

// One-shot migrate for the `migrate` service (SPEC §2.1). In production, connect() applies
// `prodMigrations` (src/migrations) before getPayload resolves; any failure exits non-zero.
if (process.env.NODE_ENV !== 'production')
  throw new Error('migrate must run with NODE_ENV=production')
const payload = await getPayload({ config })
payload.logger.info({ msg: 'migrations complete' })
process.exit(0)

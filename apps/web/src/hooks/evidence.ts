import { ValidationError } from 'payload'
import type { CollectionBeforeChangeHook } from 'payload'

/** Awards must carry evidence (SPEC §5.2). */
export const requireEvidence: CollectionBeforeChangeHook = ({ data, req }) => {
  const d = data as Record<string, unknown>
  const hasUrl = typeof d.evidenceUrl === 'string' && d.evidenceUrl.trim() !== ''
  if (!hasUrl && !d.evidenceFile) {
    throw new ValidationError({
      errors: [{ path: 'evidenceUrl', message: 'Awards need an evidence link or file' }],
      req,
    })
  }
  return data
}

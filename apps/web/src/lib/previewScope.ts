import { AsyncLocalStorage } from 'node:async_hooks'
import type { PreviewClaim } from './previewToken'

/** Set only by the token-checked /preview route so one document can be read before it is published. */
export const previewScope = new AsyncLocalStorage<PreviewClaim>()

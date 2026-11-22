import { cache } from 'react'
import { cms } from './cms'
import { FX, type FxKey, type Intensity } from './motionFx'
import type { Media } from '@/payload-types'

export type MotionState = {
  on: boolean
  intensity: Intensity
  /** Effect keys that are switched on (empty when the master switch is off). */
  fx: FxKey[]
  slides: Media[]
  slideSeconds: number
}

/** Motion settings from the CMS, read per request so an admin toggle takes effect without a rebuild. */
export const getMotion = cache(async (): Promise<MotionState> => {
  try {
    const payload = await cms()
    const g = await payload.findGlobal({ slug: 'motion-settings', depth: 1, overrideAccess: false })
    const effects = (g.effects ?? {}) as Record<string, boolean | null | undefined>
    const on = g.enabled !== false
    return {
      on,
      intensity: g.intensity ?? 'standard',
      fx: on ? FX.map(([k]) => k).filter((k) => effects[k] !== false) : [],
      slides: (g.heroSlides ?? []).filter((m): m is Media => typeof m === 'object'),
      slideSeconds: g.slideSeconds ?? 7,
    }
  } catch {
    // Settings missing (first boot): everything on, no extra slides.
    return { on: true, intensity: 'standard', fx: FX.map(([k]) => k), slides: [], slideSeconds: 7 }
  }
})

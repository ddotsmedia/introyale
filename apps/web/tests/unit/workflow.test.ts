import { describe, expect, it } from 'vitest'
import { checkTransition } from '../../src/lib/workflow'
import type { Role } from '../../src/lib/roles'

describe('workflow transitions', () => {
  it('lets a content editor submit a draft for review', () => {
    expect(checkTransition('draft', 'in_review', 'content_editor').ok).toBe(true)
  })

  it('stops marketing reviewers from submitting', () => {
    expect(checkTransition('draft', 'in_review', 'marketing_reviewer').ok).toBe(false)
  })

  it('lets a marketing reviewer approve but not publish', () => {
    expect(checkTransition('in_review', 'approved', 'marketing_reviewer').ok).toBe(true)
    expect(checkTransition('approved', 'published', 'marketing_reviewer').ok).toBe(false)
  })

  it('allows only administrator and publisher to publish', () => {
    expect(checkTransition('approved', 'published', 'administrator').ok).toBe(true)
    expect(checkTransition('approved', 'published', 'publisher').ok).toBe(true)
    const others: Role[] = ['content_editor', 'project_editor', 'marketing_reviewer']
    for (const r of others) expect(checkTransition('approved', 'published', r).ok).toBe(false)
  })

  it('rejects skipping states, even for administrators', () => {
    const r = checkTransition('draft', 'published', 'administrator')
    expect(r.ok).toBe(false)
  })

  it('treats a new document as draft', () => {
    expect(checkTransition(undefined, 'draft', 'content_editor').ok).toBe(true)
    expect(checkTransition(undefined, 'published', 'administrator').ok).toBe(false)
  })

  it('allows unchanged status for anyone', () => {
    expect(checkTransition('published', 'published', undefined).ok).toBe(true)
  })
})

import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const common = resolve(__dirname, '../../../../scripts/_common.sh')
  .split(String.fromCharCode(92))
  .join('/')
const hasBash = spawnSync('bash', ['-c', 'true']).status === 0

const stale = (tags: string[], keep: string[]) =>
  spawnSync(
    'bash',
    ['-c', `source "${common}"; stale_tags ${keep.map((k) => `"${k}"`).join(' ')}`],
    {
      input: tags.join('\n'),
      encoding: 'utf8',
    },
  )
    .stdout.split('\n')
    .filter(Boolean)

describe.skipIf(!hasBash)('image retention tag selection', () => {
  it('never selects the running or last-good tag', () => {
    expect(stale(['a1', 'b2', 'c3', 'd4'], ['c3', 'b2'])).toEqual(['a1', 'd4'])
  })
  it('selects nothing when running and last-good are the only tags', () => {
    expect(stale(['c3'], ['c3', 'c3'])).toEqual([])
  })
  it('ignores <none> and empty keep values', () => {
    expect(stale(['<none>', 'a1'], ['', 'x'])).toEqual(['a1'])
  })
})

describe.skipIf(!hasBash)('disk preflight', () => {
  it('aborts when free space is below the minimum', () => {
    const r = spawnSync('bash', ['-c', `source "${common}"; check_disk 99999999`], {
      encoding: 'utf8',
    })
    expect(r.status).not.toBe(0)
    expect(r.stderr).toContain('deploy aborted')
  })
  it('passes with a 0 GB minimum', () => {
    expect(spawnSync('bash', ['-c', `source "${common}"; check_disk 0`]).status).toBe(0)
  })
})

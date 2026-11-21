import { readFileSync } from 'node:fs'

/** Reads NAME from NAME_FILE (Docker secret) first, then NAME from env. Never logs values. */
export function readSecret(name: string): string {
  const file = process.env[`${name}_FILE`]
  if (file) return readFileSync(file, 'utf8').trim()
  return process.env[name] ?? ''
}

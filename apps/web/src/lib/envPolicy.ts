// Deployment environment policy (local preview, M-LOCAL). ENV is one of: local, dev, staging, production.
// MFA_ENFORCE=false is honoured only when ENV=local. In any other environment it refuses to start.
export type AppEnv = 'local' | 'dev' | 'staging' | 'production'

export function appEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const v = source.ENV ?? 'production'
  return v === 'local' || v === 'dev' || v === 'staging' || v === 'production' ? v : 'production'
}

/** Throws when the environment asks for an MFA bypass outside local. Called once at boot. */
export function assertEnvPolicy(source: Record<string, string | undefined> = process.env): void {
  if (source.MFA_ENFORCE === 'false' && appEnv(source) !== 'local')
    throw new Error(`MFA_ENFORCE=false is not allowed when ENV=${appEnv(source)}`)
}

/** Admin MFA is enforced unless the environment is local and MFA_ENFORCE is explicitly false. */
export function mfaEnforced(source: Record<string, string | undefined> = process.env): boolean {
  return !(appEnv(source) === 'local' && source.MFA_ENFORCE === 'false')
}

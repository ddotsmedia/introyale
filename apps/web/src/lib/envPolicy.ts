// Deployment environment (ENV is one of: local, dev, staging, production). Two-factor authentication is opt-in for
// every role (owner decision, D10), so there is no MFA switch here any more.
export type AppEnv = 'local' | 'dev' | 'staging' | 'production'

export function appEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const v = source.ENV ?? 'production'
  return v === 'local' || v === 'dev' || v === 'staging' || v === 'production' ? v : 'production'
}

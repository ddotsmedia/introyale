// Bundles CLI entry points (worker, migrate, seeds) with all deps inlined so the cli image ships only native sharp.
import { build } from 'esbuild'

// CLI_TEST=1 (CI/local stack only) also bundles the test-lead seeder into dist-cli-test; never shipped in the image.
const test = process.env.CLI_TEST === '1'
const entries = Object.fromEntries(
  [
    'src/worker.ts',
    'src/migrate.ts',
    'scripts/seed-live-content.ts',
    'scripts/seed-legal.ts',
    'scripts/admin-user.ts',
    'scripts/seed-motion.ts',
  ]
    .concat(test ? ['scripts/seed-test-leads.ts'] : [])
    .map((f) => [f.split('/').pop().replace('.ts', ''), f]),
)
await build({
  entryPoints: entries,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  tsconfig: 'tsconfig.json',
  outdir: test ? 'dist-cli-test' : 'dist-cli',
  splitting: true,
  minifyWhitespace: true,
  minifySyntax: true,
  external: ['sharp', 'pg-native', '@img/*', 'esbuild', 'lightningcss'],
  banner: { js: "import{createRequire as __cr}from'module';const require=__cr(import.meta.url);" },
  logLevel: 'error',
})

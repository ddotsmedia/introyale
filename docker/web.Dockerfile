# syntax=docker/dockerfile:1
# Multi-stage, non-root (uid 10001), read-only rootfs compatible. No secrets in any layer (SPEC §2.5).
ARG NODE_IMAGE=node:22-slim@sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee

FROM ${NODE_IMAGE} AS deps
WORKDIR /repo
RUN npm install -g pnpm@12.18.0 --no-audit --no-fund
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

FROM deps AS dev
COPY . .
WORKDIR /repo/apps/web
CMD ["pnpm", "exec", "next", "dev", "--hostname", "0.0.0.0", "--port", "3000"]

FROM deps AS build
COPY . .
RUN pnpm -C apps/web build && pnpm -C apps/web build:worker && pnpm -C apps/web build:migrate && pnpm -C apps/web build:seed-live && pnpm -C apps/web build:seed-legal && pnpm -C apps/web build:admin-user \
 && pnpm --filter @introyale/web deploy --prod /out

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0
WORKDIR /app
# Runtime needs no npm/corepack; removing them drops their bundled deps from the scan surface.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \n && groupadd -g 10001 app && useradd -u 10001 -g app -M -d /app app
# Next standalone server (traced node_modules included).
COPY --from=build --chown=10001:10001 /repo/apps/web/.next/standalone/ /app/server/
COPY --from=build --chown=10001:10001 /repo/apps/web/.next/static/ /app/server/apps/web/.next/static/
COPY --from=build --chown=10001:10001 /repo/apps/web/public/ /app/server/apps/web/public/
# Worker, migrate and payload CLI runtime deps.
COPY --from=build --chown=10001:10001 /repo/apps/web/dist/ /app/cli/dist/
COPY --from=build --chown=10001:10001 /out/node_modules /app/cli/node_modules
COPY --from=build --chown=10001:10001 /out/package.json /app/cli/package.json
USER 10001:10001
EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "/app/server/apps/web/server.js"]

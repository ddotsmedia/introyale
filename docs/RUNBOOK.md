# Runbook

Status: M2 complete (local). Ports and VPS details filled at M11.

## Local dev

```
bash scripts/gen-secrets.sh dev
docker compose -p introyale-dev -f compose.yaml -f compose.dev.yaml up -d --build
# web http://127.0.0.1:3000 · mailpit http://127.0.0.1:8025 · db 127.0.0.1:55432
```

Dev DB uses a host port on a non-internal network (Docker does not publish ports on internal networks).

## Deploy / rollback (VPS, M11+)

- `GH_OWNER=<owner> scripts/deploy.sh staging <sha>`; production adds a pre-deploy backup.
- Failed health or smoke → automatic rollback to `/opt/introyale/<env>/.last_good_tag`.
- Manual: `GH_OWNER=<owner> scripts/rollback.sh <env> <tag>`.

## Restore

- `scripts/restore.sh <env> <dump> ` restores into `introyale_restore` and verifies; `--promote` renames it live (previous kept as `introyale_pre_restore`).

## Safety

- Every compose call is `-p introyale-<env>`. No prune, no global restarts. Nginx: `nginx -t && systemctl reload nginx` only.

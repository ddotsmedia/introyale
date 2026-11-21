# Restore log

Entries added per restore drill (M2, M13).

## Restore drill (M2, local prodtest stack)

- Date: 2026-11-21
- Source: backups/prodtest/dumps/introyale-20261121T114114Z.dump (pg_dump -Fc)
- Restored to scratch DB introyale_restore via scripts/restore.sh (no --promote)
- Verify: users rows 0 (empty dev content), payload_migrations rows 1 — PASS
- Not done: render web against restored DB (scratch web stack) — open

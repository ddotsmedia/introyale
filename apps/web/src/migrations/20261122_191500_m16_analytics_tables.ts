import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// First-party analytics and CRM tasks. Plain tables (not Payload collections): high write volume, no admin CRUD.
// Days are Dubai calendar days (UTC+4, no DST). Raw events are kept 90 days, daily aggregates 25 months.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "analytics_sessions" (
    "sid" varchar PRIMARY KEY,
    "vid" varchar NOT NULL,
    "day" date NOT NULL,
    "first_ts" timestamptz NOT NULL DEFAULT now(),
    "last_ts" timestamptz NOT NULL DEFAULT now(),
    "entry_path" varchar NOT NULL,
    "exit_path" varchar NOT NULL,
    "pages" integer NOT NULL DEFAULT 0,
    "events" integer NOT NULL DEFAULT 0,
    "ref_domain" varchar NOT NULL DEFAULT '',
    "source" varchar NOT NULL DEFAULT 'direct',
    "utm_medium" varchar,
    "utm_campaign" varchar,
    "device" varchar NOT NULL DEFAULT 'desktop',
    "browser" varchar NOT NULL DEFAULT 'Other',
    "os" varchar NOT NULL DEFAULT 'Other',
    "screen" varchar NOT NULL DEFAULT 'unknown',
    "lang" varchar,
    "region" varchar
  );
  CREATE INDEX IF NOT EXISTS "analytics_sessions_day_idx" ON "analytics_sessions" ("day");
  CREATE INDEX IF NOT EXISTS "analytics_sessions_vid_idx" ON "analytics_sessions" ("vid", "last_ts");
  CREATE INDEX IF NOT EXISTS "analytics_sessions_last_idx" ON "analytics_sessions" ("last_ts");

  CREATE TABLE IF NOT EXISTS "analytics_events" (
    "id" bigserial PRIMARY KEY,
    "ts" timestamptz NOT NULL DEFAULT now(),
    "day" date NOT NULL,
    "sid" varchar NOT NULL,
    "vid" varchar NOT NULL,
    "type" varchar NOT NULL,
    "path" varchar NOT NULL,
    "title" varchar,
    "tpl" varchar,
    "name" varchar,
    "value" double precision
  );
  CREATE INDEX IF NOT EXISTS "analytics_events_ts_idx" ON "analytics_events" ("ts");
  CREATE INDEX IF NOT EXISTS "analytics_events_day_type_idx" ON "analytics_events" ("day", "type");
  CREATE INDEX IF NOT EXISTS "analytics_events_path_idx" ON "analytics_events" ("path", "ts");
  CREATE INDEX IF NOT EXISTS "analytics_events_sid_idx" ON "analytics_events" ("sid");

  CREATE TABLE IF NOT EXISTS "analytics_daily" (
    "day" date NOT NULL,
    "kind" varchar NOT NULL,
    "key" varchar NOT NULL,
    "visitors" integer NOT NULL DEFAULT 0,
    "sessions" integer NOT NULL DEFAULT 0,
    "views" integer NOT NULL DEFAULT 0,
    "extra" integer NOT NULL DEFAULT 0,
    "val" double precision NOT NULL DEFAULT 0,
    PRIMARY KEY ("day", "kind", "key")
  );
  CREATE INDEX IF NOT EXISTS "analytics_daily_kind_idx" ON "analytics_daily" ("kind", "day");

  CREATE TABLE IF NOT EXISTS "analytics_salts" ("day" date PRIMARY KEY, "salt" varchar NOT NULL);
  CREATE TABLE IF NOT EXISTS "analytics_meta" ("k" varchar PRIMARY KEY, "v" varchar NOT NULL);

  CREATE TABLE IF NOT EXISTS "lead_tasks" (
    "id" serial PRIMARY KEY,
    "enquiry_id" integer NOT NULL REFERENCES "enquiries"("id") ON DELETE CASCADE,
    "kind" varchar NOT NULL DEFAULT 'task',
    "title" varchar NOT NULL,
    "due_at" timestamptz NOT NULL,
    "assignee_id" integer,
    "done_at" timestamptz,
    "created_by" integer,
    "created_at" timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS "lead_tasks_due_idx" ON "lead_tasks" ("due_at") WHERE "done_at" IS NULL;
  CREATE INDEX IF NOT EXISTS "lead_tasks_enquiry_idx" ON "lead_tasks" ("enquiry_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "lead_tasks";
  DROP TABLE IF EXISTS "analytics_meta";
  DROP TABLE IF EXISTS "analytics_salts";
  DROP TABLE IF EXISTS "analytics_daily";
  DROP TABLE IF EXISTS "analytics_events";
  DROP TABLE IF EXISTS "analytics_sessions";`)
}

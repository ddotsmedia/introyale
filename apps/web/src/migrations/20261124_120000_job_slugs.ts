import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The analytics tasks were added after the job-slug enums were last generated, so queueing them failed in
// production ("invalid input value for enum enum_payload_jobs_task_slug"). Additive and idempotent.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE IF NOT EXISTS 'analyticsNightly';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE IF NOT EXISTS 'analyticsWeeklyReport';
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_payload_jobs_log_task_slug') THEN
      ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE IF NOT EXISTS 'analyticsNightly';
      ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE IF NOT EXISTS 'analyticsWeeklyReport';
    END IF;
  END $$;`)
}

// Enum values cannot be dropped; leaving them is harmless.
export async function down(_args: MigrateDownArgs): Promise<void> {}

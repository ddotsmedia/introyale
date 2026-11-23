import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Developer credit in the footer bottom bar. Defaults live in the columns, so the existing footer row is filled
// without touching any other footer field; the INSERT only covers a database that has no footer row yet.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "footer" ADD COLUMN "credit_text" varchar DEFAULT 'Built and managed by';
  ALTER TABLE "footer" ADD COLUMN "credit_name" varchar DEFAULT 'Ddotsmedia Technologies LLC';
  ALTER TABLE "footer" ADD COLUMN "credit_url" varchar DEFAULT 'https://ddotsmedia.com';
  ALTER TABLE "footer" ADD COLUMN "show_credit" boolean DEFAULT true;
  INSERT INTO "footer" ("updated_at", "created_at") SELECT now(), now() WHERE NOT EXISTS (SELECT 1 FROM "footer");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "footer" DROP COLUMN "credit_text";
  ALTER TABLE "footer" DROP COLUMN "credit_name";
  ALTER TABLE "footer" DROP COLUMN "credit_url";
  ALTER TABLE "footer" DROP COLUMN "show_credit";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "seo_focus_keyword" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_seo_focus_keyword" varchar;
  ALTER TABLE "services" ADD COLUMN "seo_focus_keyword" varchar;
  ALTER TABLE "_services_v" ADD COLUMN "version_seo_focus_keyword" varchar;
  ALTER TABLE "sectors" ADD COLUMN "seo_focus_keyword" varchar;
  ALTER TABLE "_sectors_v" ADD COLUMN "version_seo_focus_keyword" varchar;
  ALTER TABLE "team_members" ADD COLUMN "seo_focus_keyword" varchar;
  ALTER TABLE "_team_members_v" ADD COLUMN "version_seo_focus_keyword" varchar;
  ALTER TABLE "journal_posts" ADD COLUMN "seo_focus_keyword" varchar;
  ALTER TABLE "_journal_posts_v" ADD COLUMN "version_seo_focus_keyword" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_focus_keyword" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_focus_keyword" varchar;
  ALTER TABLE "home_page" ADD COLUMN "seo_focus_keyword" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "seo_focus_keyword";
  ALTER TABLE "_projects_v" DROP COLUMN "version_seo_focus_keyword";
  ALTER TABLE "services" DROP COLUMN "seo_focus_keyword";
  ALTER TABLE "_services_v" DROP COLUMN "version_seo_focus_keyword";
  ALTER TABLE "sectors" DROP COLUMN "seo_focus_keyword";
  ALTER TABLE "_sectors_v" DROP COLUMN "version_seo_focus_keyword";
  ALTER TABLE "team_members" DROP COLUMN "seo_focus_keyword";
  ALTER TABLE "_team_members_v" DROP COLUMN "version_seo_focus_keyword";
  ALTER TABLE "journal_posts" DROP COLUMN "seo_focus_keyword";
  ALTER TABLE "_journal_posts_v" DROP COLUMN "version_seo_focus_keyword";
  ALTER TABLE "pages" DROP COLUMN "seo_focus_keyword";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_focus_keyword";
  ALTER TABLE "home_page" DROP COLUMN "seo_focus_keyword";`)
}

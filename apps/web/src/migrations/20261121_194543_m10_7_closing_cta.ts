import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "closing_cta_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "closing_cta_button_href" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "closing_cta_heading" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "closing_cta_text" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "closing_cta_button_label" varchar;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_closing_cta_image_id_media_id_fk" FOREIGN KEY ("closing_cta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_closing_cta_closing_cta_image_idx" ON "site_settings" USING btree ("closing_cta_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_closing_cta_image_id_media_id_fk";
  
  DROP INDEX "site_settings_closing_cta_closing_cta_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "closing_cta_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "closing_cta_button_href";
  ALTER TABLE "site_settings_locales" DROP COLUMN "closing_cta_heading";
  ALTER TABLE "site_settings_locales" DROP COLUMN "closing_cta_text";
  ALTER TABLE "site_settings_locales" DROP COLUMN "closing_cta_button_label";`)
}

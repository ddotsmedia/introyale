import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "hero_id" integer;
  ALTER TABLE "pages_locales" ADD COLUMN "intro" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_id" integer;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_intro" varchar;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_id_media_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_id_media_id_fk" FOREIGN KEY ("version_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_idx" ON "pages" USING btree ("hero_id");
  CREATE INDEX "_pages_v_version_version_hero_idx" ON "_pages_v" USING btree ("version_hero_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_id_media_id_fk";
  
  DROP INDEX "pages_hero_idx";
  DROP INDEX "_pages_v_version_version_hero_idx";
  ALTER TABLE "pages" DROP COLUMN "hero_id";
  ALTER TABLE "pages_locales" DROP COLUMN "intro";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_id";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_intro";`)
}

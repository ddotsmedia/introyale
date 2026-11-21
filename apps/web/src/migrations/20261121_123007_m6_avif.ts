import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_a480_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a480_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a480_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a480_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a480_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a480_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a768_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a768_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a768_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a768_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a768_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a768_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1080_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1080_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1080_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1080_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1080_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1080_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1440_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1440_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1440_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1440_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1440_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1440_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1920_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1920_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1920_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1920_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a1920_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a1920_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a2560_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a2560_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a2560_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a2560_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_a2560_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_a2560_filename" varchar;
  CREATE INDEX "media_sizes_a480_sizes_a480_filename_idx" ON "media" USING btree ("sizes_a480_filename");
  CREATE INDEX "media_sizes_a768_sizes_a768_filename_idx" ON "media" USING btree ("sizes_a768_filename");
  CREATE INDEX "media_sizes_a1080_sizes_a1080_filename_idx" ON "media" USING btree ("sizes_a1080_filename");
  CREATE INDEX "media_sizes_a1440_sizes_a1440_filename_idx" ON "media" USING btree ("sizes_a1440_filename");
  CREATE INDEX "media_sizes_a1920_sizes_a1920_filename_idx" ON "media" USING btree ("sizes_a1920_filename");
  CREATE INDEX "media_sizes_a2560_sizes_a2560_filename_idx" ON "media" USING btree ("sizes_a2560_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_a480_sizes_a480_filename_idx";
  DROP INDEX "media_sizes_a768_sizes_a768_filename_idx";
  DROP INDEX "media_sizes_a1080_sizes_a1080_filename_idx";
  DROP INDEX "media_sizes_a1440_sizes_a1440_filename_idx";
  DROP INDEX "media_sizes_a1920_sizes_a1920_filename_idx";
  DROP INDEX "media_sizes_a2560_sizes_a2560_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_a480_url";
  ALTER TABLE "media" DROP COLUMN "sizes_a480_width";
  ALTER TABLE "media" DROP COLUMN "sizes_a480_height";
  ALTER TABLE "media" DROP COLUMN "sizes_a480_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_a480_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_a480_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_a768_url";
  ALTER TABLE "media" DROP COLUMN "sizes_a768_width";
  ALTER TABLE "media" DROP COLUMN "sizes_a768_height";
  ALTER TABLE "media" DROP COLUMN "sizes_a768_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_a768_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_a768_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_a1080_url";
  ALTER TABLE "media" DROP COLUMN "sizes_a1080_width";
  ALTER TABLE "media" DROP COLUMN "sizes_a1080_height";
  ALTER TABLE "media" DROP COLUMN "sizes_a1080_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_a1080_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_a1080_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_a1440_url";
  ALTER TABLE "media" DROP COLUMN "sizes_a1440_width";
  ALTER TABLE "media" DROP COLUMN "sizes_a1440_height";
  ALTER TABLE "media" DROP COLUMN "sizes_a1440_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_a1440_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_a1440_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_a1920_url";
  ALTER TABLE "media" DROP COLUMN "sizes_a1920_width";
  ALTER TABLE "media" DROP COLUMN "sizes_a1920_height";
  ALTER TABLE "media" DROP COLUMN "sizes_a1920_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_a1920_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_a1920_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_a2560_url";
  ALTER TABLE "media" DROP COLUMN "sizes_a2560_width";
  ALTER TABLE "media" DROP COLUMN "sizes_a2560_height";
  ALTER TABLE "media" DROP COLUMN "sizes_a2560_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_a2560_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_a2560_filename";`)
}

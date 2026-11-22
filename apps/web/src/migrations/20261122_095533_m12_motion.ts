import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_blocks_featured_work_display" AS ENUM('grid', 'horizontal');
  CREATE TYPE "public"."enum_services_blocks_client_wall_display" AS ENUM('grid', 'marquee');
  CREATE TYPE "public"."enum__services_v_blocks_featured_work_display" AS ENUM('grid', 'horizontal');
  CREATE TYPE "public"."enum__services_v_blocks_client_wall_display" AS ENUM('grid', 'marquee');
  CREATE TYPE "public"."enum_sectors_blocks_featured_work_display" AS ENUM('grid', 'horizontal');
  CREATE TYPE "public"."enum_sectors_blocks_client_wall_display" AS ENUM('grid', 'marquee');
  CREATE TYPE "public"."enum__sectors_v_blocks_featured_work_display" AS ENUM('grid', 'horizontal');
  CREATE TYPE "public"."enum__sectors_v_blocks_client_wall_display" AS ENUM('grid', 'marquee');
  CREATE TYPE "public"."enum_pages_blocks_featured_work_display" AS ENUM('grid', 'horizontal');
  CREATE TYPE "public"."enum_pages_blocks_client_wall_display" AS ENUM('grid', 'marquee');
  CREATE TYPE "public"."enum__pages_v_blocks_featured_work_display" AS ENUM('grid', 'horizontal');
  CREATE TYPE "public"."enum__pages_v_blocks_client_wall_display" AS ENUM('grid', 'marquee');
  CREATE TYPE "public"."enum_home_page_blocks_featured_work_display" AS ENUM('grid', 'horizontal');
  CREATE TYPE "public"."enum_home_page_blocks_client_wall_display" AS ENUM('grid', 'marquee');
  CREATE TYPE "public"."enum_motion_settings_intensity" AS ENUM('subtle', 'standard', 'expressive');
  CREATE TABLE "services_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_statement_locales" (
  	"eyebrow" varchar,
  	"statement" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_before_after_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_before_after_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_statement_locales" (
  	"eyebrow" varchar,
  	"statement" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_before_after_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_before_after_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_statement_locales" (
  	"eyebrow" varchar,
  	"statement" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_before_after_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_before_after_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_statement_locales" (
  	"eyebrow" varchar,
  	"statement" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_before_after_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_before_after_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_statement_locales" (
  	"eyebrow" varchar,
  	"statement" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_before_after_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_before_after_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_statement_locales" (
  	"eyebrow" varchar,
  	"statement" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_before_after_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_before_after_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_statement_locales" (
  	"eyebrow" varchar,
  	"statement" varchar NOT NULL,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_before_after_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_before_after_spotlight_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "motion_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"intensity" "enum_motion_settings_intensity" DEFAULT 'standard',
  	"slide_seconds" numeric DEFAULT 7,
  	"effects_hero_slideshow" boolean DEFAULT true,
  	"effects_headline_reveal" boolean DEFAULT true,
  	"effects_scroll_cue" boolean DEFAULT true,
  	"effects_page_transitions" boolean DEFAULT true,
  	"effects_header" boolean DEFAULT true,
  	"effects_mobile_menu" boolean DEFAULT true,
  	"effects_magnetic" boolean DEFAULT true,
  	"effects_image_reveals" boolean DEFAULT true,
  	"effects_parallax" boolean DEFAULT true,
  	"effects_heading_reveals" boolean DEFAULT true,
  	"effects_statement" boolean DEFAULT true,
  	"effects_count_up" boolean DEFAULT true,
  	"effects_process_line" boolean DEFAULT true,
  	"effects_horizontal_gallery" boolean DEFAULT true,
  	"effects_curtain" boolean DEFAULT true,
  	"effects_cards" boolean DEFAULT true,
  	"effects_services_float" boolean DEFAULT true,
  	"effects_sector_panels" boolean DEFAULT true,
  	"effects_marquee" boolean DEFAULT true,
  	"effects_before_after_hint" boolean DEFAULT true,
  	"effects_blur_up" boolean DEFAULT true,
  	"effects_lightbox" boolean DEFAULT true,
  	"effects_case_study" boolean DEFAULT true,
  	"effects_not_found" boolean DEFAULT true,
  	"effects_form_steps" boolean DEFAULT true,
  	"effects_back_to_top" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "motion_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "media" ADD COLUMN "lqip" varchar;
  ALTER TABLE "media" ADD COLUMN "dominant" varchar;
  ALTER TABLE "services_blocks_featured_work" ADD COLUMN "display" "enum_services_blocks_featured_work_display" DEFAULT 'grid';
  ALTER TABLE "services_blocks_client_wall" ADD COLUMN "display" "enum_services_blocks_client_wall_display" DEFAULT 'grid';
  ALTER TABLE "_services_v_blocks_featured_work" ADD COLUMN "display" "enum__services_v_blocks_featured_work_display" DEFAULT 'grid';
  ALTER TABLE "_services_v_blocks_client_wall" ADD COLUMN "display" "enum__services_v_blocks_client_wall_display" DEFAULT 'grid';
  ALTER TABLE "sectors_blocks_featured_work" ADD COLUMN "display" "enum_sectors_blocks_featured_work_display" DEFAULT 'grid';
  ALTER TABLE "sectors_blocks_client_wall" ADD COLUMN "display" "enum_sectors_blocks_client_wall_display" DEFAULT 'grid';
  ALTER TABLE "_sectors_v_blocks_featured_work" ADD COLUMN "display" "enum__sectors_v_blocks_featured_work_display" DEFAULT 'grid';
  ALTER TABLE "_sectors_v_blocks_client_wall" ADD COLUMN "display" "enum__sectors_v_blocks_client_wall_display" DEFAULT 'grid';
  ALTER TABLE "pages_blocks_featured_work" ADD COLUMN "display" "enum_pages_blocks_featured_work_display" DEFAULT 'grid';
  ALTER TABLE "pages_blocks_client_wall" ADD COLUMN "display" "enum_pages_blocks_client_wall_display" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_featured_work" ADD COLUMN "display" "enum__pages_v_blocks_featured_work_display" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_client_wall" ADD COLUMN "display" "enum__pages_v_blocks_client_wall_display" DEFAULT 'grid';
  ALTER TABLE "home_page_blocks_featured_work" ADD COLUMN "display" "enum_home_page_blocks_featured_work_display" DEFAULT 'grid';
  ALTER TABLE "home_page_blocks_client_wall" ADD COLUMN "display" "enum_home_page_blocks_client_wall_display" DEFAULT 'grid';
  ALTER TABLE "services_blocks_statement" ADD CONSTRAINT "services_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_statement_locales" ADD CONSTRAINT "services_blocks_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after_spotlight" ADD CONSTRAINT "services_blocks_before_after_spotlight_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after_spotlight" ADD CONSTRAINT "services_blocks_before_after_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_before_after_spotlight_locales" ADD CONSTRAINT "services_blocks_before_after_spotlight_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_before_after_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_statement" ADD CONSTRAINT "_services_v_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_statement_locales" ADD CONSTRAINT "_services_v_blocks_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after_spotlight" ADD CONSTRAINT "_services_v_blocks_before_after_spotlight_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after_spotlight" ADD CONSTRAINT "_services_v_blocks_before_after_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_before_after_spotlight_locales" ADD CONSTRAINT "_services_v_blocks_before_after_spotlight_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_before_after_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_statement" ADD CONSTRAINT "sectors_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_statement_locales" ADD CONSTRAINT "sectors_blocks_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_before_after_spotlight" ADD CONSTRAINT "sectors_blocks_before_after_spotlight_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_blocks_before_after_spotlight" ADD CONSTRAINT "sectors_blocks_before_after_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_before_after_spotlight_locales" ADD CONSTRAINT "sectors_blocks_before_after_spotlight_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_before_after_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_statement" ADD CONSTRAINT "_sectors_v_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_statement_locales" ADD CONSTRAINT "_sectors_v_blocks_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_before_after_spotlight" ADD CONSTRAINT "_sectors_v_blocks_before_after_spotlight_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_before_after_spotlight" ADD CONSTRAINT "_sectors_v_blocks_before_after_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_before_after_spotlight_locales" ADD CONSTRAINT "_sectors_v_blocks_before_after_spotlight_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_before_after_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statement" ADD CONSTRAINT "pages_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statement_locales" ADD CONSTRAINT "pages_blocks_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_spotlight" ADD CONSTRAINT "pages_blocks_before_after_spotlight_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_spotlight" ADD CONSTRAINT "pages_blocks_before_after_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_before_after_spotlight_locales" ADD CONSTRAINT "pages_blocks_before_after_spotlight_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_before_after_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statement" ADD CONSTRAINT "_pages_v_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statement_locales" ADD CONSTRAINT "_pages_v_blocks_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_spotlight" ADD CONSTRAINT "_pages_v_blocks_before_after_spotlight_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_spotlight" ADD CONSTRAINT "_pages_v_blocks_before_after_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_before_after_spotlight_locales" ADD CONSTRAINT "_pages_v_blocks_before_after_spotlight_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_before_after_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_statement" ADD CONSTRAINT "home_page_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_statement_locales" ADD CONSTRAINT "home_page_blocks_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_before_after_spotlight" ADD CONSTRAINT "home_page_blocks_before_after_spotlight_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_before_after_spotlight" ADD CONSTRAINT "home_page_blocks_before_after_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_before_after_spotlight_locales" ADD CONSTRAINT "home_page_blocks_before_after_spotlight_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_before_after_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "motion_settings_rels" ADD CONSTRAINT "motion_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."motion_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "motion_settings_rels" ADD CONSTRAINT "motion_settings_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_statement_order_idx" ON "services_blocks_statement" USING btree ("_order");
  CREATE INDEX "services_blocks_statement_parent_id_idx" ON "services_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_statement_path_idx" ON "services_blocks_statement" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_statement_locales_locale_parent_id_unique" ON "services_blocks_statement_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_statement_locales_parent_id_idx" ON "services_blocks_statement_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_before_after_spotlight_order_idx" ON "services_blocks_before_after_spotlight" USING btree ("_order");
  CREATE INDEX "services_blocks_before_after_spotlight_parent_id_idx" ON "services_blocks_before_after_spotlight" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_before_after_spotlight_path_idx" ON "services_blocks_before_after_spotlight" USING btree ("_path");
  CREATE INDEX "services_blocks_before_after_spotlight_project_idx" ON "services_blocks_before_after_spotlight" USING btree ("project_id");
  CREATE UNIQUE INDEX "services_blocks_before_after_spotlight_locales_locale_parent" ON "services_blocks_before_after_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_before_after_spotlight_locales_parent_id_idx" ON "services_blocks_before_after_spotlight_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_statement_order_idx" ON "_services_v_blocks_statement" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_statement_parent_id_idx" ON "_services_v_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_statement_path_idx" ON "_services_v_blocks_statement" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_statement_locales_locale_parent_id_unique" ON "_services_v_blocks_statement_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_statement_locales_parent_id_idx" ON "_services_v_blocks_statement_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_before_after_spotlight_order_idx" ON "_services_v_blocks_before_after_spotlight" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_before_after_spotlight_parent_id_idx" ON "_services_v_blocks_before_after_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_before_after_spotlight_path_idx" ON "_services_v_blocks_before_after_spotlight" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_before_after_spotlight_project_idx" ON "_services_v_blocks_before_after_spotlight" USING btree ("project_id");
  CREATE UNIQUE INDEX "_services_v_blocks_before_after_spotlight_locales_locale_par" ON "_services_v_blocks_before_after_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_before_after_spotlight_locales_parent_idx" ON "_services_v_blocks_before_after_spotlight_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_statement_order_idx" ON "sectors_blocks_statement" USING btree ("_order");
  CREATE INDEX "sectors_blocks_statement_parent_id_idx" ON "sectors_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_statement_path_idx" ON "sectors_blocks_statement" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_statement_locales_locale_parent_id_unique" ON "sectors_blocks_statement_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_statement_locales_parent_id_idx" ON "sectors_blocks_statement_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_before_after_spotlight_order_idx" ON "sectors_blocks_before_after_spotlight" USING btree ("_order");
  CREATE INDEX "sectors_blocks_before_after_spotlight_parent_id_idx" ON "sectors_blocks_before_after_spotlight" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_before_after_spotlight_path_idx" ON "sectors_blocks_before_after_spotlight" USING btree ("_path");
  CREATE INDEX "sectors_blocks_before_after_spotlight_project_idx" ON "sectors_blocks_before_after_spotlight" USING btree ("project_id");
  CREATE UNIQUE INDEX "sectors_blocks_before_after_spotlight_locales_locale_parent_" ON "sectors_blocks_before_after_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_before_after_spotlight_locales_parent_id_idx" ON "sectors_blocks_before_after_spotlight_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_statement_order_idx" ON "_sectors_v_blocks_statement" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_statement_parent_id_idx" ON "_sectors_v_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_statement_path_idx" ON "_sectors_v_blocks_statement" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_statement_locales_locale_parent_id_unique" ON "_sectors_v_blocks_statement_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_statement_locales_parent_id_idx" ON "_sectors_v_blocks_statement_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_before_after_spotlight_order_idx" ON "_sectors_v_blocks_before_after_spotlight" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_before_after_spotlight_parent_id_idx" ON "_sectors_v_blocks_before_after_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_before_after_spotlight_path_idx" ON "_sectors_v_blocks_before_after_spotlight" USING btree ("_path");
  CREATE INDEX "_sectors_v_blocks_before_after_spotlight_project_idx" ON "_sectors_v_blocks_before_after_spotlight" USING btree ("project_id");
  CREATE UNIQUE INDEX "_sectors_v_blocks_before_after_spotlight_locales_locale_pare" ON "_sectors_v_blocks_before_after_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_before_after_spotlight_locales_parent__idx" ON "_sectors_v_blocks_before_after_spotlight_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statement_order_idx" ON "pages_blocks_statement" USING btree ("_order");
  CREATE INDEX "pages_blocks_statement_parent_id_idx" ON "pages_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statement_path_idx" ON "pages_blocks_statement" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_statement_locales_locale_parent_id_unique" ON "pages_blocks_statement_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_statement_locales_parent_id_idx" ON "pages_blocks_statement_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_before_after_spotlight_order_idx" ON "pages_blocks_before_after_spotlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_before_after_spotlight_parent_id_idx" ON "pages_blocks_before_after_spotlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_before_after_spotlight_path_idx" ON "pages_blocks_before_after_spotlight" USING btree ("_path");
  CREATE INDEX "pages_blocks_before_after_spotlight_project_idx" ON "pages_blocks_before_after_spotlight" USING btree ("project_id");
  CREATE UNIQUE INDEX "pages_blocks_before_after_spotlight_locales_locale_parent_id" ON "pages_blocks_before_after_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_before_after_spotlight_locales_parent_id_idx" ON "pages_blocks_before_after_spotlight_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statement_order_idx" ON "_pages_v_blocks_statement" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_statement_parent_id_idx" ON "_pages_v_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statement_path_idx" ON "_pages_v_blocks_statement" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_statement_locales_locale_parent_id_unique" ON "_pages_v_blocks_statement_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_statement_locales_parent_id_idx" ON "_pages_v_blocks_statement_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_before_after_spotlight_order_idx" ON "_pages_v_blocks_before_after_spotlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_before_after_spotlight_parent_id_idx" ON "_pages_v_blocks_before_after_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_before_after_spotlight_path_idx" ON "_pages_v_blocks_before_after_spotlight" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_before_after_spotlight_project_idx" ON "_pages_v_blocks_before_after_spotlight" USING btree ("project_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_before_after_spotlight_locales_locale_parent" ON "_pages_v_blocks_before_after_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_before_after_spotlight_locales_parent_id_idx" ON "_pages_v_blocks_before_after_spotlight_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_statement_order_idx" ON "home_page_blocks_statement" USING btree ("_order");
  CREATE INDEX "home_page_blocks_statement_parent_id_idx" ON "home_page_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_statement_path_idx" ON "home_page_blocks_statement" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_statement_locales_locale_parent_id_unique" ON "home_page_blocks_statement_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_statement_locales_parent_id_idx" ON "home_page_blocks_statement_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_before_after_spotlight_order_idx" ON "home_page_blocks_before_after_spotlight" USING btree ("_order");
  CREATE INDEX "home_page_blocks_before_after_spotlight_parent_id_idx" ON "home_page_blocks_before_after_spotlight" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_before_after_spotlight_path_idx" ON "home_page_blocks_before_after_spotlight" USING btree ("_path");
  CREATE INDEX "home_page_blocks_before_after_spotlight_project_idx" ON "home_page_blocks_before_after_spotlight" USING btree ("project_id");
  CREATE UNIQUE INDEX "home_page_blocks_before_after_spotlight_locales_locale_paren" ON "home_page_blocks_before_after_spotlight_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_before_after_spotlight_locales_parent_i_idx" ON "home_page_blocks_before_after_spotlight_locales" USING btree ("_parent_id");
  CREATE INDEX "motion_settings_rels_order_idx" ON "motion_settings_rels" USING btree ("order");
  CREATE INDEX "motion_settings_rels_parent_idx" ON "motion_settings_rels" USING btree ("parent_id");
  CREATE INDEX "motion_settings_rels_path_idx" ON "motion_settings_rels" USING btree ("path");
  CREATE INDEX "motion_settings_rels_media_id_idx" ON "motion_settings_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_blocks_statement" CASCADE;
  DROP TABLE "services_blocks_statement_locales" CASCADE;
  DROP TABLE "services_blocks_before_after_spotlight" CASCADE;
  DROP TABLE "services_blocks_before_after_spotlight_locales" CASCADE;
  DROP TABLE "_services_v_blocks_statement" CASCADE;
  DROP TABLE "_services_v_blocks_statement_locales" CASCADE;
  DROP TABLE "_services_v_blocks_before_after_spotlight" CASCADE;
  DROP TABLE "_services_v_blocks_before_after_spotlight_locales" CASCADE;
  DROP TABLE "sectors_blocks_statement" CASCADE;
  DROP TABLE "sectors_blocks_statement_locales" CASCADE;
  DROP TABLE "sectors_blocks_before_after_spotlight" CASCADE;
  DROP TABLE "sectors_blocks_before_after_spotlight_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_statement" CASCADE;
  DROP TABLE "_sectors_v_blocks_statement_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_before_after_spotlight" CASCADE;
  DROP TABLE "_sectors_v_blocks_before_after_spotlight_locales" CASCADE;
  DROP TABLE "pages_blocks_statement" CASCADE;
  DROP TABLE "pages_blocks_statement_locales" CASCADE;
  DROP TABLE "pages_blocks_before_after_spotlight" CASCADE;
  DROP TABLE "pages_blocks_before_after_spotlight_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_statement" CASCADE;
  DROP TABLE "_pages_v_blocks_statement_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_before_after_spotlight" CASCADE;
  DROP TABLE "_pages_v_blocks_before_after_spotlight_locales" CASCADE;
  DROP TABLE "home_page_blocks_statement" CASCADE;
  DROP TABLE "home_page_blocks_statement_locales" CASCADE;
  DROP TABLE "home_page_blocks_before_after_spotlight" CASCADE;
  DROP TABLE "home_page_blocks_before_after_spotlight_locales" CASCADE;
  DROP TABLE "motion_settings" CASCADE;
  DROP TABLE "motion_settings_rels" CASCADE;
  ALTER TABLE "media" DROP COLUMN "lqip";
  ALTER TABLE "media" DROP COLUMN "dominant";
  ALTER TABLE "services_blocks_featured_work" DROP COLUMN "display";
  ALTER TABLE "services_blocks_client_wall" DROP COLUMN "display";
  ALTER TABLE "_services_v_blocks_featured_work" DROP COLUMN "display";
  ALTER TABLE "_services_v_blocks_client_wall" DROP COLUMN "display";
  ALTER TABLE "sectors_blocks_featured_work" DROP COLUMN "display";
  ALTER TABLE "sectors_blocks_client_wall" DROP COLUMN "display";
  ALTER TABLE "_sectors_v_blocks_featured_work" DROP COLUMN "display";
  ALTER TABLE "_sectors_v_blocks_client_wall" DROP COLUMN "display";
  ALTER TABLE "pages_blocks_featured_work" DROP COLUMN "display";
  ALTER TABLE "pages_blocks_client_wall" DROP COLUMN "display";
  ALTER TABLE "_pages_v_blocks_featured_work" DROP COLUMN "display";
  ALTER TABLE "_pages_v_blocks_client_wall" DROP COLUMN "display";
  ALTER TABLE "home_page_blocks_featured_work" DROP COLUMN "display";
  ALTER TABLE "home_page_blocks_client_wall" DROP COLUMN "display";
  DROP TYPE "public"."enum_services_blocks_featured_work_display";
  DROP TYPE "public"."enum_services_blocks_client_wall_display";
  DROP TYPE "public"."enum__services_v_blocks_featured_work_display";
  DROP TYPE "public"."enum__services_v_blocks_client_wall_display";
  DROP TYPE "public"."enum_sectors_blocks_featured_work_display";
  DROP TYPE "public"."enum_sectors_blocks_client_wall_display";
  DROP TYPE "public"."enum__sectors_v_blocks_featured_work_display";
  DROP TYPE "public"."enum__sectors_v_blocks_client_wall_display";
  DROP TYPE "public"."enum_pages_blocks_featured_work_display";
  DROP TYPE "public"."enum_pages_blocks_client_wall_display";
  DROP TYPE "public"."enum__pages_v_blocks_featured_work_display";
  DROP TYPE "public"."enum__pages_v_blocks_client_wall_display";
  DROP TYPE "public"."enum_home_page_blocks_featured_work_display";
  DROP TYPE "public"."enum_home_page_blocks_client_wall_display";
  DROP TYPE "public"."enum_motion_settings_intensity";`)
}

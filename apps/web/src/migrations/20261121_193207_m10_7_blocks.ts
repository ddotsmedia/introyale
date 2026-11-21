import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_blocks_hero_size" AS ENUM('full', 'banner');
  CREATE TYPE "public"."enum_services_blocks_process_steps_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum_services_blocks_image_text_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_services_blocks_text_section_columns" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_services_blocks_enquiry_form_form" AS ENUM('contact', 'consultation');
  CREATE TYPE "public"."enum__services_v_blocks_hero_size" AS ENUM('full', 'banner');
  CREATE TYPE "public"."enum__services_v_blocks_process_steps_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum__services_v_blocks_image_text_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__services_v_blocks_text_section_columns" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__services_v_blocks_enquiry_form_form" AS ENUM('contact', 'consultation');
  CREATE TYPE "public"."enum_sectors_blocks_hero_size" AS ENUM('full', 'banner');
  CREATE TYPE "public"."enum_sectors_blocks_process_steps_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum_sectors_blocks_image_text_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_sectors_blocks_text_section_columns" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_sectors_blocks_enquiry_form_form" AS ENUM('contact', 'consultation');
  CREATE TYPE "public"."enum__sectors_v_blocks_hero_size" AS ENUM('full', 'banner');
  CREATE TYPE "public"."enum__sectors_v_blocks_process_steps_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum__sectors_v_blocks_image_text_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__sectors_v_blocks_text_section_columns" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__sectors_v_blocks_enquiry_form_form" AS ENUM('contact', 'consultation');
  CREATE TYPE "public"."enum_pages_blocks_hero_size" AS ENUM('full', 'banner');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum_pages_blocks_image_text_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_text_section_columns" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_pages_blocks_enquiry_form_form" AS ENUM('contact', 'consultation');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_size" AS ENUM('full', 'banner');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_text_section_columns" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__pages_v_blocks_enquiry_form_form" AS ENUM('contact', 'consultation');
  CREATE TYPE "public"."enum_home_page_blocks_hero_size" AS ENUM('full', 'banner');
  CREATE TYPE "public"."enum_home_page_blocks_process_steps_tone" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum_home_page_blocks_image_text_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_home_page_blocks_text_section_columns" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_home_page_blocks_enquiry_form_form" AS ENUM('contact', 'consultation');
  CREATE TABLE "services_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"overlay" numeric DEFAULT 45,
  	"size" "enum_services_blocks_hero_size" DEFAULT 'full',
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subhead" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fact_key" varchar
  );
  
  CREATE TABLE "services_blocks_intro_stats_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_intro_stats_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_featured_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 5,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_featured_work_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_sector_tiles_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_services_list_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tone" "enum_services_blocks_process_steps_tone" DEFAULT 'dark',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_client_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_client_wall_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"button_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_cta_band_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum_services_blocks_image_text_image_side" DEFAULT 'right',
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_text_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_services_blocks_text_section_columns" DEFAULT '1',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_text_section_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_hours" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_contact_info_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form" "enum_services_blocks_enquiry_form_form" DEFAULT 'contact',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_enquiry_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"overlay" numeric DEFAULT 45,
  	"size" "enum__services_v_blocks_hero_size" DEFAULT 'full',
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subhead" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"fact_key" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_intro_stats_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_intro_stats_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_featured_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 5,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_featured_work_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_sector_tiles_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_services_list_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tone" "enum__services_v_blocks_process_steps_tone" DEFAULT 'dark',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_client_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_client_wall_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"button_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cta_band_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum__services_v_blocks_image_text_image_side" DEFAULT 'right',
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_image_text_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"columns" "enum__services_v_blocks_text_section_columns" DEFAULT '1',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_text_section_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_hours" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_contact_info_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form" "enum__services_v_blocks_enquiry_form_form" DEFAULT 'contact',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_enquiry_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"overlay" numeric DEFAULT 45,
  	"size" "enum_sectors_blocks_hero_size" DEFAULT 'full',
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subhead" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fact_key" varchar
  );
  
  CREATE TABLE "sectors_blocks_intro_stats_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_intro_stats_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_featured_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 5,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_featured_work_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_sector_tiles_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_services_list_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tone" "enum_sectors_blocks_process_steps_tone" DEFAULT 'dark',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_client_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_client_wall_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"button_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_cta_band_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum_sectors_blocks_image_text_image_side" DEFAULT 'right',
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_image_text_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_sectors_blocks_text_section_columns" DEFAULT '1',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_text_section_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_hours" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_contact_info_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sectors_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form" "enum_sectors_blocks_enquiry_form_form" DEFAULT 'contact',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "sectors_blocks_enquiry_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"overlay" numeric DEFAULT 45,
  	"size" "enum__sectors_v_blocks_hero_size" DEFAULT 'full',
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subhead" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"fact_key" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_intro_stats_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_intro_stats_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_featured_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 5,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_featured_work_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_sector_tiles_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_services_list_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tone" "enum__sectors_v_blocks_process_steps_tone" DEFAULT 'dark',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_client_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_client_wall_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"button_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_cta_band_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum__sectors_v_blocks_image_text_image_side" DEFAULT 'right',
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_image_text_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"columns" "enum__sectors_v_blocks_text_section_columns" DEFAULT '1',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_text_section_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_hours" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_contact_info_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form" "enum__sectors_v_blocks_enquiry_form_form" DEFAULT 'contact',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_sectors_v_blocks_enquiry_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"overlay" numeric DEFAULT 45,
  	"size" "enum_pages_blocks_hero_size" DEFAULT 'full',
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subhead" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fact_key" varchar
  );
  
  CREATE TABLE "pages_blocks_intro_stats_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_intro_stats_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_featured_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 5,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_work_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sector_tiles_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_list_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tone" "enum_pages_blocks_process_steps_tone" DEFAULT 'dark',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_client_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_client_wall_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"button_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_band_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum_pages_blocks_image_text_image_side" DEFAULT 'right',
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_text_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_pages_blocks_text_section_columns" DEFAULT '1',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_section_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_hours" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_info_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form" "enum_pages_blocks_enquiry_form_form" DEFAULT 'contact',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_enquiry_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"sectors_id" integer,
  	"services_id" integer,
  	"clients_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"overlay" numeric DEFAULT 45,
  	"size" "enum__pages_v_blocks_hero_size" DEFAULT 'full',
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subhead" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"fact_key" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_intro_stats_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_intro_stats_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_featured_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 5,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_featured_work_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sector_tiles_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_list_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tone" "enum__pages_v_blocks_process_steps_tone" DEFAULT 'dark',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_client_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_client_wall_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"button_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum__pages_v_blocks_image_text_image_side" DEFAULT 'right',
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_text_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"columns" "enum__pages_v_blocks_text_section_columns" DEFAULT '1',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_section_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_hours" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_info_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form" "enum__pages_v_blocks_enquiry_form_form" DEFAULT 'contact',
  	"hidden" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_enquiry_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"sectors_id" integer,
  	"services_id" integer,
  	"clients_id" integer
  );
  
  CREATE TABLE "home_page_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"overlay" numeric DEFAULT 45,
  	"size" "enum_home_page_blocks_hero_size" DEFAULT 'full',
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"headline" varchar NOT NULL,
  	"subhead" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_intro_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fact_key" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_intro_stats_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_intro_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_intro_stats_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_featured_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 5,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_featured_work_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_sector_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_sector_tiles_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_services_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_services_list_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_process_steps_steps_locales" (
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tone" "enum_home_page_blocks_process_steps_tone" DEFAULT 'dark',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_client_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"view_all_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_client_wall_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"view_all_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"button_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_cta_band_locales" (
  	"heading" varchar NOT NULL,
  	"text" varchar,
  	"button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_side" "enum_home_page_blocks_image_text_image_side" DEFAULT 'right',
  	"cta_href" varchar,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_image_text_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_home_page_blocks_text_section_columns" DEFAULT '1',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_text_section_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_hours" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_contact_info_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_blocks_enquiry_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form" "enum_home_page_blocks_enquiry_form_form" DEFAULT 'contact',
  	"hidden" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_page_blocks_enquiry_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_og_image_id" integer,
  	"seo_canonical_override" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_locales" (
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"sectors_id" integer,
  	"services_id" integer,
  	"clients_id" integer
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link" varchar
  );
  
  CREATE TABLE "footer_columns_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_columns_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "projects" ADD COLUMN "admin_note" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_admin_note" varchar;
  ALTER TABLE "services" ADD COLUMN "sector_id" integer;
  ALTER TABLE "services" ADD COLUMN "image_id" integer;
  ALTER TABLE "services_rels" ADD COLUMN "sectors_id" integer;
  ALTER TABLE "services_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "services_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "_services_v" ADD COLUMN "version_sector_id" integer;
  ALTER TABLE "_services_v" ADD COLUMN "version_image_id" integer;
  ALTER TABLE "_services_v_rels" ADD COLUMN "sectors_id" integer;
  ALTER TABLE "_services_v_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "_services_v_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "sectors_rels" ADD COLUMN "sectors_id" integer;
  ALTER TABLE "sectors_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "sectors_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "_sectors_v_rels" ADD COLUMN "sectors_id" integer;
  ALTER TABLE "_sectors_v_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "_sectors_v_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "clients" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "site_settings" ADD COLUMN "footer_logo_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "cta_link" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "tagline" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "contact_info" ADD COLUMN "sales_email_fact_key" varchar;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_hero" ADD CONSTRAINT "services_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_hero_locales" ADD CONSTRAINT "services_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_intro_stats_stats" ADD CONSTRAINT "services_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_intro_stats_stats_locales" ADD CONSTRAINT "services_blocks_intro_stats_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_intro_stats_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_intro_stats" ADD CONSTRAINT "services_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_intro_stats_locales" ADD CONSTRAINT "services_blocks_intro_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_featured_work" ADD CONSTRAINT "services_blocks_featured_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_featured_work_locales" ADD CONSTRAINT "services_blocks_featured_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_featured_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_sector_tiles" ADD CONSTRAINT "services_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_sector_tiles_locales" ADD CONSTRAINT "services_blocks_sector_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_sector_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_services_list" ADD CONSTRAINT "services_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_services_list_locales" ADD CONSTRAINT "services_blocks_services_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_process_steps_steps" ADD CONSTRAINT "services_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_process_steps_steps_locales" ADD CONSTRAINT "services_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_process_steps" ADD CONSTRAINT "services_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_process_steps_locales" ADD CONSTRAINT "services_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_client_wall" ADD CONSTRAINT "services_blocks_client_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_client_wall_locales" ADD CONSTRAINT "services_blocks_client_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_client_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta_band" ADD CONSTRAINT "services_blocks_cta_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_cta_band" ADD CONSTRAINT "services_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta_band_locales" ADD CONSTRAINT "services_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text" ADD CONSTRAINT "services_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text" ADD CONSTRAINT "services_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_text_locales" ADD CONSTRAINT "services_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_text_section" ADD CONSTRAINT "services_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_text_section_locales" ADD CONSTRAINT "services_blocks_text_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_text_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_contact_info" ADD CONSTRAINT "services_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_contact_info_locales" ADD CONSTRAINT "services_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_enquiry_form" ADD CONSTRAINT "services_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_enquiry_form_locales" ADD CONSTRAINT "services_blocks_enquiry_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_hero" ADD CONSTRAINT "_services_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_hero" ADD CONSTRAINT "_services_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_hero_locales" ADD CONSTRAINT "_services_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_intro_stats_stats" ADD CONSTRAINT "_services_v_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_intro_stats_stats_locales" ADD CONSTRAINT "_services_v_blocks_intro_stats_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_intro_stats_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_intro_stats" ADD CONSTRAINT "_services_v_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_intro_stats_locales" ADD CONSTRAINT "_services_v_blocks_intro_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_featured_work" ADD CONSTRAINT "_services_v_blocks_featured_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_featured_work_locales" ADD CONSTRAINT "_services_v_blocks_featured_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_featured_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_sector_tiles" ADD CONSTRAINT "_services_v_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_sector_tiles_locales" ADD CONSTRAINT "_services_v_blocks_sector_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_sector_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_services_list" ADD CONSTRAINT "_services_v_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_services_list_locales" ADD CONSTRAINT "_services_v_blocks_services_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_process_steps_steps" ADD CONSTRAINT "_services_v_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_process_steps_steps_locales" ADD CONSTRAINT "_services_v_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_process_steps" ADD CONSTRAINT "_services_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_process_steps_locales" ADD CONSTRAINT "_services_v_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_client_wall" ADD CONSTRAINT "_services_v_blocks_client_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_client_wall_locales" ADD CONSTRAINT "_services_v_blocks_client_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_client_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta_band" ADD CONSTRAINT "_services_v_blocks_cta_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta_band" ADD CONSTRAINT "_services_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta_band_locales" ADD CONSTRAINT "_services_v_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_text" ADD CONSTRAINT "_services_v_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_text" ADD CONSTRAINT "_services_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_text_locales" ADD CONSTRAINT "_services_v_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_text_section" ADD CONSTRAINT "_services_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_text_section_locales" ADD CONSTRAINT "_services_v_blocks_text_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_text_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_contact_info" ADD CONSTRAINT "_services_v_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_contact_info_locales" ADD CONSTRAINT "_services_v_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_enquiry_form" ADD CONSTRAINT "_services_v_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_enquiry_form_locales" ADD CONSTRAINT "_services_v_blocks_enquiry_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_hero" ADD CONSTRAINT "sectors_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_blocks_hero" ADD CONSTRAINT "sectors_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_hero_locales" ADD CONSTRAINT "sectors_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_intro_stats_stats" ADD CONSTRAINT "sectors_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_intro_stats_stats_locales" ADD CONSTRAINT "sectors_blocks_intro_stats_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_intro_stats_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_intro_stats" ADD CONSTRAINT "sectors_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_intro_stats_locales" ADD CONSTRAINT "sectors_blocks_intro_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_featured_work" ADD CONSTRAINT "sectors_blocks_featured_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_featured_work_locales" ADD CONSTRAINT "sectors_blocks_featured_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_featured_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_sector_tiles" ADD CONSTRAINT "sectors_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_sector_tiles_locales" ADD CONSTRAINT "sectors_blocks_sector_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_sector_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_services_list" ADD CONSTRAINT "sectors_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_services_list_locales" ADD CONSTRAINT "sectors_blocks_services_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_process_steps_steps" ADD CONSTRAINT "sectors_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_process_steps_steps_locales" ADD CONSTRAINT "sectors_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_process_steps" ADD CONSTRAINT "sectors_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_process_steps_locales" ADD CONSTRAINT "sectors_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_client_wall" ADD CONSTRAINT "sectors_blocks_client_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_client_wall_locales" ADD CONSTRAINT "sectors_blocks_client_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_client_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_cta_band" ADD CONSTRAINT "sectors_blocks_cta_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_blocks_cta_band" ADD CONSTRAINT "sectors_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_cta_band_locales" ADD CONSTRAINT "sectors_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_image_text" ADD CONSTRAINT "sectors_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_blocks_image_text" ADD CONSTRAINT "sectors_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_image_text_locales" ADD CONSTRAINT "sectors_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_text_section" ADD CONSTRAINT "sectors_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_text_section_locales" ADD CONSTRAINT "sectors_blocks_text_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_text_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_contact_info" ADD CONSTRAINT "sectors_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_contact_info_locales" ADD CONSTRAINT "sectors_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_enquiry_form" ADD CONSTRAINT "sectors_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_blocks_enquiry_form_locales" ADD CONSTRAINT "sectors_blocks_enquiry_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_hero" ADD CONSTRAINT "_sectors_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_hero" ADD CONSTRAINT "_sectors_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_hero_locales" ADD CONSTRAINT "_sectors_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_intro_stats_stats" ADD CONSTRAINT "_sectors_v_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_intro_stats_stats_locales" ADD CONSTRAINT "_sectors_v_blocks_intro_stats_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_intro_stats_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_intro_stats" ADD CONSTRAINT "_sectors_v_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_intro_stats_locales" ADD CONSTRAINT "_sectors_v_blocks_intro_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_featured_work" ADD CONSTRAINT "_sectors_v_blocks_featured_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_featured_work_locales" ADD CONSTRAINT "_sectors_v_blocks_featured_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_featured_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_sector_tiles" ADD CONSTRAINT "_sectors_v_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_sector_tiles_locales" ADD CONSTRAINT "_sectors_v_blocks_sector_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_sector_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_services_list" ADD CONSTRAINT "_sectors_v_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_services_list_locales" ADD CONSTRAINT "_sectors_v_blocks_services_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_process_steps_steps" ADD CONSTRAINT "_sectors_v_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_process_steps_steps_locales" ADD CONSTRAINT "_sectors_v_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_process_steps" ADD CONSTRAINT "_sectors_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_process_steps_locales" ADD CONSTRAINT "_sectors_v_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_client_wall" ADD CONSTRAINT "_sectors_v_blocks_client_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_client_wall_locales" ADD CONSTRAINT "_sectors_v_blocks_client_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_client_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_cta_band" ADD CONSTRAINT "_sectors_v_blocks_cta_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_cta_band" ADD CONSTRAINT "_sectors_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_cta_band_locales" ADD CONSTRAINT "_sectors_v_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_image_text" ADD CONSTRAINT "_sectors_v_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_image_text" ADD CONSTRAINT "_sectors_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_image_text_locales" ADD CONSTRAINT "_sectors_v_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_text_section" ADD CONSTRAINT "_sectors_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_text_section_locales" ADD CONSTRAINT "_sectors_v_blocks_text_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_text_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_contact_info" ADD CONSTRAINT "_sectors_v_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_contact_info_locales" ADD CONSTRAINT "_sectors_v_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_enquiry_form" ADD CONSTRAINT "_sectors_v_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_blocks_enquiry_form_locales" ADD CONSTRAINT "_sectors_v_blocks_enquiry_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro_stats_stats" ADD CONSTRAINT "pages_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro_stats_stats_locales" ADD CONSTRAINT "pages_blocks_intro_stats_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_intro_stats_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro_stats" ADD CONSTRAINT "pages_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_intro_stats_locales" ADD CONSTRAINT "pages_blocks_intro_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_work" ADD CONSTRAINT "pages_blocks_featured_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_work_locales" ADD CONSTRAINT "pages_blocks_featured_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_featured_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sector_tiles" ADD CONSTRAINT "pages_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sector_tiles_locales" ADD CONSTRAINT "pages_blocks_sector_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sector_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_list" ADD CONSTRAINT "pages_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_list_locales" ADD CONSTRAINT "pages_blocks_services_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_steps" ADD CONSTRAINT "pages_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_steps_locales" ADD CONSTRAINT "pages_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_locales" ADD CONSTRAINT "pages_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_client_wall" ADD CONSTRAINT "pages_blocks_client_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_client_wall_locales" ADD CONSTRAINT "pages_blocks_client_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_client_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_locales" ADD CONSTRAINT "pages_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text_locales" ADD CONSTRAINT "pages_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_section" ADD CONSTRAINT "pages_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_section_locales" ADD CONSTRAINT "pages_blocks_text_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_text_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_info" ADD CONSTRAINT "pages_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_info_locales" ADD CONSTRAINT "pages_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_enquiry_form" ADD CONSTRAINT "pages_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_enquiry_form_locales" ADD CONSTRAINT "pages_blocks_enquiry_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_locales" ADD CONSTRAINT "_pages_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro_stats_stats" ADD CONSTRAINT "_pages_v_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro_stats_stats_locales" ADD CONSTRAINT "_pages_v_blocks_intro_stats_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_intro_stats_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro_stats" ADD CONSTRAINT "_pages_v_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_intro_stats_locales" ADD CONSTRAINT "_pages_v_blocks_intro_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_work" ADD CONSTRAINT "_pages_v_blocks_featured_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_work_locales" ADD CONSTRAINT "_pages_v_blocks_featured_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_featured_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sector_tiles" ADD CONSTRAINT "_pages_v_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sector_tiles_locales" ADD CONSTRAINT "_pages_v_blocks_sector_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sector_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_list" ADD CONSTRAINT "_pages_v_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_list_locales" ADD CONSTRAINT "_pages_v_blocks_services_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_steps_locales" ADD CONSTRAINT "_pages_v_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_locales" ADD CONSTRAINT "_pages_v_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_client_wall" ADD CONSTRAINT "_pages_v_blocks_client_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_client_wall_locales" ADD CONSTRAINT "_pages_v_blocks_client_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_client_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band" ADD CONSTRAINT "_pages_v_blocks_cta_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band" ADD CONSTRAINT "_pages_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band_locales" ADD CONSTRAINT "_pages_v_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text_locales" ADD CONSTRAINT "_pages_v_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_section" ADD CONSTRAINT "_pages_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_section_locales" ADD CONSTRAINT "_pages_v_blocks_text_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_text_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info" ADD CONSTRAINT "_pages_v_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_info_locales" ADD CONSTRAINT "_pages_v_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_enquiry_form" ADD CONSTRAINT "_pages_v_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_enquiry_form_locales" ADD CONSTRAINT "_pages_v_blocks_enquiry_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_hero" ADD CONSTRAINT "home_page_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_hero" ADD CONSTRAINT "home_page_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_hero_locales" ADD CONSTRAINT "home_page_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_intro_stats_stats" ADD CONSTRAINT "home_page_blocks_intro_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_intro_stats_stats_locales" ADD CONSTRAINT "home_page_blocks_intro_stats_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_intro_stats_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_intro_stats" ADD CONSTRAINT "home_page_blocks_intro_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_intro_stats_locales" ADD CONSTRAINT "home_page_blocks_intro_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_intro_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_featured_work" ADD CONSTRAINT "home_page_blocks_featured_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_featured_work_locales" ADD CONSTRAINT "home_page_blocks_featured_work_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_featured_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_sector_tiles" ADD CONSTRAINT "home_page_blocks_sector_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_sector_tiles_locales" ADD CONSTRAINT "home_page_blocks_sector_tiles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_sector_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_services_list" ADD CONSTRAINT "home_page_blocks_services_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_services_list_locales" ADD CONSTRAINT "home_page_blocks_services_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_services_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_process_steps_steps" ADD CONSTRAINT "home_page_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_process_steps_steps_locales" ADD CONSTRAINT "home_page_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_process_steps" ADD CONSTRAINT "home_page_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_process_steps_locales" ADD CONSTRAINT "home_page_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_client_wall" ADD CONSTRAINT "home_page_blocks_client_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_client_wall_locales" ADD CONSTRAINT "home_page_blocks_client_wall_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_client_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_cta_band" ADD CONSTRAINT "home_page_blocks_cta_band_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_cta_band" ADD CONSTRAINT "home_page_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_cta_band_locales" ADD CONSTRAINT "home_page_blocks_cta_band_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_image_text" ADD CONSTRAINT "home_page_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_blocks_image_text" ADD CONSTRAINT "home_page_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_image_text_locales" ADD CONSTRAINT "home_page_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_text_section" ADD CONSTRAINT "home_page_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_text_section_locales" ADD CONSTRAINT "home_page_blocks_text_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_text_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_contact_info" ADD CONSTRAINT "home_page_blocks_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_contact_info_locales" ADD CONSTRAINT "home_page_blocks_contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_enquiry_form" ADD CONSTRAINT "home_page_blocks_enquiry_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_blocks_enquiry_form_locales" ADD CONSTRAINT "home_page_blocks_enquiry_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_blocks_enquiry_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_locales" ADD CONSTRAINT "home_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links_locales" ADD CONSTRAINT "footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_hero_order_idx" ON "services_blocks_hero" USING btree ("_order");
  CREATE INDEX "services_blocks_hero_parent_id_idx" ON "services_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_hero_path_idx" ON "services_blocks_hero" USING btree ("_path");
  CREATE INDEX "services_blocks_hero_image_idx" ON "services_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "services_blocks_hero_locales_locale_parent_id_unique" ON "services_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_hero_locales_parent_id_idx" ON "services_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_intro_stats_stats_order_idx" ON "services_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "services_blocks_intro_stats_stats_parent_id_idx" ON "services_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_blocks_intro_stats_stats_locales_locale_parent_id_u" ON "services_blocks_intro_stats_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_intro_stats_stats_locales_parent_id_idx" ON "services_blocks_intro_stats_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_intro_stats_order_idx" ON "services_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "services_blocks_intro_stats_parent_id_idx" ON "services_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_intro_stats_path_idx" ON "services_blocks_intro_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_intro_stats_locales_locale_parent_id_unique" ON "services_blocks_intro_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_intro_stats_locales_parent_id_idx" ON "services_blocks_intro_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_featured_work_order_idx" ON "services_blocks_featured_work" USING btree ("_order");
  CREATE INDEX "services_blocks_featured_work_parent_id_idx" ON "services_blocks_featured_work" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_featured_work_path_idx" ON "services_blocks_featured_work" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_featured_work_locales_locale_parent_id_uniqu" ON "services_blocks_featured_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_featured_work_locales_parent_id_idx" ON "services_blocks_featured_work_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_sector_tiles_order_idx" ON "services_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "services_blocks_sector_tiles_parent_id_idx" ON "services_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_sector_tiles_path_idx" ON "services_blocks_sector_tiles" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_sector_tiles_locales_locale_parent_id_unique" ON "services_blocks_sector_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_sector_tiles_locales_parent_id_idx" ON "services_blocks_sector_tiles_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_services_list_order_idx" ON "services_blocks_services_list" USING btree ("_order");
  CREATE INDEX "services_blocks_services_list_parent_id_idx" ON "services_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_services_list_path_idx" ON "services_blocks_services_list" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_services_list_locales_locale_parent_id_uniqu" ON "services_blocks_services_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_services_list_locales_parent_id_idx" ON "services_blocks_services_list_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_process_steps_steps_order_idx" ON "services_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "services_blocks_process_steps_steps_parent_id_idx" ON "services_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_blocks_process_steps_steps_locales_locale_parent_id" ON "services_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_process_steps_steps_locales_parent_id_idx" ON "services_blocks_process_steps_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_process_steps_order_idx" ON "services_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "services_blocks_process_steps_parent_id_idx" ON "services_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_process_steps_path_idx" ON "services_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_process_steps_locales_locale_parent_id_uniqu" ON "services_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_process_steps_locales_parent_id_idx" ON "services_blocks_process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_client_wall_order_idx" ON "services_blocks_client_wall" USING btree ("_order");
  CREATE INDEX "services_blocks_client_wall_parent_id_idx" ON "services_blocks_client_wall" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_client_wall_path_idx" ON "services_blocks_client_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_client_wall_locales_locale_parent_id_unique" ON "services_blocks_client_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_client_wall_locales_parent_id_idx" ON "services_blocks_client_wall_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_band_order_idx" ON "services_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_band_parent_id_idx" ON "services_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_band_path_idx" ON "services_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "services_blocks_cta_band_image_idx" ON "services_blocks_cta_band" USING btree ("image_id");
  CREATE UNIQUE INDEX "services_blocks_cta_band_locales_locale_parent_id_unique" ON "services_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_cta_band_locales_parent_id_idx" ON "services_blocks_cta_band_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_text_order_idx" ON "services_blocks_image_text" USING btree ("_order");
  CREATE INDEX "services_blocks_image_text_parent_id_idx" ON "services_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_text_path_idx" ON "services_blocks_image_text" USING btree ("_path");
  CREATE INDEX "services_blocks_image_text_image_idx" ON "services_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "services_blocks_image_text_locales_locale_parent_id_unique" ON "services_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_image_text_locales_parent_id_idx" ON "services_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_text_section_order_idx" ON "services_blocks_text_section" USING btree ("_order");
  CREATE INDEX "services_blocks_text_section_parent_id_idx" ON "services_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_text_section_path_idx" ON "services_blocks_text_section" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_text_section_locales_locale_parent_id_unique" ON "services_blocks_text_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_text_section_locales_parent_id_idx" ON "services_blocks_text_section_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_contact_info_order_idx" ON "services_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "services_blocks_contact_info_parent_id_idx" ON "services_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_contact_info_path_idx" ON "services_blocks_contact_info" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_contact_info_locales_locale_parent_id_unique" ON "services_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_contact_info_locales_parent_id_idx" ON "services_blocks_contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_enquiry_form_order_idx" ON "services_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "services_blocks_enquiry_form_parent_id_idx" ON "services_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_enquiry_form_path_idx" ON "services_blocks_enquiry_form" USING btree ("_path");
  CREATE UNIQUE INDEX "services_blocks_enquiry_form_locales_locale_parent_id_unique" ON "services_blocks_enquiry_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_blocks_enquiry_form_locales_parent_id_idx" ON "services_blocks_enquiry_form_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_hero_order_idx" ON "_services_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_hero_parent_id_idx" ON "_services_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_hero_path_idx" ON "_services_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_hero_image_idx" ON "_services_v_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "_services_v_blocks_hero_locales_locale_parent_id_unique" ON "_services_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_hero_locales_parent_id_idx" ON "_services_v_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_intro_stats_stats_order_idx" ON "_services_v_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_intro_stats_stats_parent_id_idx" ON "_services_v_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_services_v_blocks_intro_stats_stats_locales_locale_parent_i" ON "_services_v_blocks_intro_stats_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_intro_stats_stats_locales_parent_id_idx" ON "_services_v_blocks_intro_stats_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_intro_stats_order_idx" ON "_services_v_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_intro_stats_parent_id_idx" ON "_services_v_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_intro_stats_path_idx" ON "_services_v_blocks_intro_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_intro_stats_locales_locale_parent_id_uniq" ON "_services_v_blocks_intro_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_intro_stats_locales_parent_id_idx" ON "_services_v_blocks_intro_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_featured_work_order_idx" ON "_services_v_blocks_featured_work" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_featured_work_parent_id_idx" ON "_services_v_blocks_featured_work" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_featured_work_path_idx" ON "_services_v_blocks_featured_work" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_featured_work_locales_locale_parent_id_un" ON "_services_v_blocks_featured_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_featured_work_locales_parent_id_idx" ON "_services_v_blocks_featured_work_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_sector_tiles_order_idx" ON "_services_v_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_sector_tiles_parent_id_idx" ON "_services_v_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_sector_tiles_path_idx" ON "_services_v_blocks_sector_tiles" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_sector_tiles_locales_locale_parent_id_uni" ON "_services_v_blocks_sector_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_sector_tiles_locales_parent_id_idx" ON "_services_v_blocks_sector_tiles_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_services_list_order_idx" ON "_services_v_blocks_services_list" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_services_list_parent_id_idx" ON "_services_v_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_services_list_path_idx" ON "_services_v_blocks_services_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_services_list_locales_locale_parent_id_un" ON "_services_v_blocks_services_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_services_list_locales_parent_id_idx" ON "_services_v_blocks_services_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_process_steps_steps_order_idx" ON "_services_v_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_process_steps_steps_parent_id_idx" ON "_services_v_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_services_v_blocks_process_steps_steps_locales_locale_parent" ON "_services_v_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_process_steps_steps_locales_parent_id_idx" ON "_services_v_blocks_process_steps_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_process_steps_order_idx" ON "_services_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_process_steps_parent_id_idx" ON "_services_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_process_steps_path_idx" ON "_services_v_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_process_steps_locales_locale_parent_id_un" ON "_services_v_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_process_steps_locales_parent_id_idx" ON "_services_v_blocks_process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_client_wall_order_idx" ON "_services_v_blocks_client_wall" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_client_wall_parent_id_idx" ON "_services_v_blocks_client_wall" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_client_wall_path_idx" ON "_services_v_blocks_client_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_client_wall_locales_locale_parent_id_uniq" ON "_services_v_blocks_client_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_client_wall_locales_parent_id_idx" ON "_services_v_blocks_client_wall_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_band_order_idx" ON "_services_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_band_parent_id_idx" ON "_services_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_band_path_idx" ON "_services_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cta_band_image_idx" ON "_services_v_blocks_cta_band" USING btree ("image_id");
  CREATE UNIQUE INDEX "_services_v_blocks_cta_band_locales_locale_parent_id_unique" ON "_services_v_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_cta_band_locales_parent_id_idx" ON "_services_v_blocks_cta_band_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_text_order_idx" ON "_services_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_image_text_parent_id_idx" ON "_services_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_text_path_idx" ON "_services_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_image_text_image_idx" ON "_services_v_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "_services_v_blocks_image_text_locales_locale_parent_id_uniqu" ON "_services_v_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_image_text_locales_parent_id_idx" ON "_services_v_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_text_section_order_idx" ON "_services_v_blocks_text_section" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_text_section_parent_id_idx" ON "_services_v_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_text_section_path_idx" ON "_services_v_blocks_text_section" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_text_section_locales_locale_parent_id_uni" ON "_services_v_blocks_text_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_text_section_locales_parent_id_idx" ON "_services_v_blocks_text_section_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_contact_info_order_idx" ON "_services_v_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_contact_info_parent_id_idx" ON "_services_v_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_contact_info_path_idx" ON "_services_v_blocks_contact_info" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_contact_info_locales_locale_parent_id_uni" ON "_services_v_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_contact_info_locales_parent_id_idx" ON "_services_v_blocks_contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_enquiry_form_order_idx" ON "_services_v_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_enquiry_form_parent_id_idx" ON "_services_v_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_enquiry_form_path_idx" ON "_services_v_blocks_enquiry_form" USING btree ("_path");
  CREATE UNIQUE INDEX "_services_v_blocks_enquiry_form_locales_locale_parent_id_uni" ON "_services_v_blocks_enquiry_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_enquiry_form_locales_parent_id_idx" ON "_services_v_blocks_enquiry_form_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_hero_order_idx" ON "sectors_blocks_hero" USING btree ("_order");
  CREATE INDEX "sectors_blocks_hero_parent_id_idx" ON "sectors_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_hero_path_idx" ON "sectors_blocks_hero" USING btree ("_path");
  CREATE INDEX "sectors_blocks_hero_image_idx" ON "sectors_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "sectors_blocks_hero_locales_locale_parent_id_unique" ON "sectors_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_hero_locales_parent_id_idx" ON "sectors_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_intro_stats_stats_order_idx" ON "sectors_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "sectors_blocks_intro_stats_stats_parent_id_idx" ON "sectors_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sectors_blocks_intro_stats_stats_locales_locale_parent_id_un" ON "sectors_blocks_intro_stats_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_intro_stats_stats_locales_parent_id_idx" ON "sectors_blocks_intro_stats_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_intro_stats_order_idx" ON "sectors_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "sectors_blocks_intro_stats_parent_id_idx" ON "sectors_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_intro_stats_path_idx" ON "sectors_blocks_intro_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_intro_stats_locales_locale_parent_id_unique" ON "sectors_blocks_intro_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_intro_stats_locales_parent_id_idx" ON "sectors_blocks_intro_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_featured_work_order_idx" ON "sectors_blocks_featured_work" USING btree ("_order");
  CREATE INDEX "sectors_blocks_featured_work_parent_id_idx" ON "sectors_blocks_featured_work" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_featured_work_path_idx" ON "sectors_blocks_featured_work" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_featured_work_locales_locale_parent_id_unique" ON "sectors_blocks_featured_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_featured_work_locales_parent_id_idx" ON "sectors_blocks_featured_work_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_sector_tiles_order_idx" ON "sectors_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "sectors_blocks_sector_tiles_parent_id_idx" ON "sectors_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_sector_tiles_path_idx" ON "sectors_blocks_sector_tiles" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_sector_tiles_locales_locale_parent_id_unique" ON "sectors_blocks_sector_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_sector_tiles_locales_parent_id_idx" ON "sectors_blocks_sector_tiles_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_services_list_order_idx" ON "sectors_blocks_services_list" USING btree ("_order");
  CREATE INDEX "sectors_blocks_services_list_parent_id_idx" ON "sectors_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_services_list_path_idx" ON "sectors_blocks_services_list" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_services_list_locales_locale_parent_id_unique" ON "sectors_blocks_services_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_services_list_locales_parent_id_idx" ON "sectors_blocks_services_list_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_process_steps_steps_order_idx" ON "sectors_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "sectors_blocks_process_steps_steps_parent_id_idx" ON "sectors_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sectors_blocks_process_steps_steps_locales_locale_parent_id_" ON "sectors_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_process_steps_steps_locales_parent_id_idx" ON "sectors_blocks_process_steps_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_process_steps_order_idx" ON "sectors_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "sectors_blocks_process_steps_parent_id_idx" ON "sectors_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_process_steps_path_idx" ON "sectors_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_process_steps_locales_locale_parent_id_unique" ON "sectors_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_process_steps_locales_parent_id_idx" ON "sectors_blocks_process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_client_wall_order_idx" ON "sectors_blocks_client_wall" USING btree ("_order");
  CREATE INDEX "sectors_blocks_client_wall_parent_id_idx" ON "sectors_blocks_client_wall" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_client_wall_path_idx" ON "sectors_blocks_client_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_client_wall_locales_locale_parent_id_unique" ON "sectors_blocks_client_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_client_wall_locales_parent_id_idx" ON "sectors_blocks_client_wall_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_cta_band_order_idx" ON "sectors_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "sectors_blocks_cta_band_parent_id_idx" ON "sectors_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_cta_band_path_idx" ON "sectors_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "sectors_blocks_cta_band_image_idx" ON "sectors_blocks_cta_band" USING btree ("image_id");
  CREATE UNIQUE INDEX "sectors_blocks_cta_band_locales_locale_parent_id_unique" ON "sectors_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_cta_band_locales_parent_id_idx" ON "sectors_blocks_cta_band_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_image_text_order_idx" ON "sectors_blocks_image_text" USING btree ("_order");
  CREATE INDEX "sectors_blocks_image_text_parent_id_idx" ON "sectors_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_image_text_path_idx" ON "sectors_blocks_image_text" USING btree ("_path");
  CREATE INDEX "sectors_blocks_image_text_image_idx" ON "sectors_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "sectors_blocks_image_text_locales_locale_parent_id_unique" ON "sectors_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_image_text_locales_parent_id_idx" ON "sectors_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_text_section_order_idx" ON "sectors_blocks_text_section" USING btree ("_order");
  CREATE INDEX "sectors_blocks_text_section_parent_id_idx" ON "sectors_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_text_section_path_idx" ON "sectors_blocks_text_section" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_text_section_locales_locale_parent_id_unique" ON "sectors_blocks_text_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_text_section_locales_parent_id_idx" ON "sectors_blocks_text_section_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_contact_info_order_idx" ON "sectors_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "sectors_blocks_contact_info_parent_id_idx" ON "sectors_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_contact_info_path_idx" ON "sectors_blocks_contact_info" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_contact_info_locales_locale_parent_id_unique" ON "sectors_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_contact_info_locales_parent_id_idx" ON "sectors_blocks_contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_enquiry_form_order_idx" ON "sectors_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "sectors_blocks_enquiry_form_parent_id_idx" ON "sectors_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "sectors_blocks_enquiry_form_path_idx" ON "sectors_blocks_enquiry_form" USING btree ("_path");
  CREATE UNIQUE INDEX "sectors_blocks_enquiry_form_locales_locale_parent_id_unique" ON "sectors_blocks_enquiry_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_blocks_enquiry_form_locales_parent_id_idx" ON "sectors_blocks_enquiry_form_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_hero_order_idx" ON "_sectors_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_hero_parent_id_idx" ON "_sectors_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_hero_path_idx" ON "_sectors_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_sectors_v_blocks_hero_image_idx" ON "_sectors_v_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "_sectors_v_blocks_hero_locales_locale_parent_id_unique" ON "_sectors_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_hero_locales_parent_id_idx" ON "_sectors_v_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_intro_stats_stats_order_idx" ON "_sectors_v_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_intro_stats_stats_parent_id_idx" ON "_sectors_v_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_sectors_v_blocks_intro_stats_stats_locales_locale_parent_id" ON "_sectors_v_blocks_intro_stats_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_intro_stats_stats_locales_parent_id_idx" ON "_sectors_v_blocks_intro_stats_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_intro_stats_order_idx" ON "_sectors_v_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_intro_stats_parent_id_idx" ON "_sectors_v_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_intro_stats_path_idx" ON "_sectors_v_blocks_intro_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_intro_stats_locales_locale_parent_id_uniqu" ON "_sectors_v_blocks_intro_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_intro_stats_locales_parent_id_idx" ON "_sectors_v_blocks_intro_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_featured_work_order_idx" ON "_sectors_v_blocks_featured_work" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_featured_work_parent_id_idx" ON "_sectors_v_blocks_featured_work" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_featured_work_path_idx" ON "_sectors_v_blocks_featured_work" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_featured_work_locales_locale_parent_id_uni" ON "_sectors_v_blocks_featured_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_featured_work_locales_parent_id_idx" ON "_sectors_v_blocks_featured_work_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_sector_tiles_order_idx" ON "_sectors_v_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_sector_tiles_parent_id_idx" ON "_sectors_v_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_sector_tiles_path_idx" ON "_sectors_v_blocks_sector_tiles" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_sector_tiles_locales_locale_parent_id_uniq" ON "_sectors_v_blocks_sector_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_sector_tiles_locales_parent_id_idx" ON "_sectors_v_blocks_sector_tiles_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_services_list_order_idx" ON "_sectors_v_blocks_services_list" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_services_list_parent_id_idx" ON "_sectors_v_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_services_list_path_idx" ON "_sectors_v_blocks_services_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_services_list_locales_locale_parent_id_uni" ON "_sectors_v_blocks_services_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_services_list_locales_parent_id_idx" ON "_sectors_v_blocks_services_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_process_steps_steps_order_idx" ON "_sectors_v_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_process_steps_steps_parent_id_idx" ON "_sectors_v_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_sectors_v_blocks_process_steps_steps_locales_locale_parent_" ON "_sectors_v_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_process_steps_steps_locales_parent_id_idx" ON "_sectors_v_blocks_process_steps_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_process_steps_order_idx" ON "_sectors_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_process_steps_parent_id_idx" ON "_sectors_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_process_steps_path_idx" ON "_sectors_v_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_process_steps_locales_locale_parent_id_uni" ON "_sectors_v_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_process_steps_locales_parent_id_idx" ON "_sectors_v_blocks_process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_client_wall_order_idx" ON "_sectors_v_blocks_client_wall" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_client_wall_parent_id_idx" ON "_sectors_v_blocks_client_wall" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_client_wall_path_idx" ON "_sectors_v_blocks_client_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_client_wall_locales_locale_parent_id_uniqu" ON "_sectors_v_blocks_client_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_client_wall_locales_parent_id_idx" ON "_sectors_v_blocks_client_wall_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_cta_band_order_idx" ON "_sectors_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_cta_band_parent_id_idx" ON "_sectors_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_cta_band_path_idx" ON "_sectors_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_sectors_v_blocks_cta_band_image_idx" ON "_sectors_v_blocks_cta_band" USING btree ("image_id");
  CREATE UNIQUE INDEX "_sectors_v_blocks_cta_band_locales_locale_parent_id_unique" ON "_sectors_v_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_cta_band_locales_parent_id_idx" ON "_sectors_v_blocks_cta_band_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_image_text_order_idx" ON "_sectors_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_image_text_parent_id_idx" ON "_sectors_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_image_text_path_idx" ON "_sectors_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_sectors_v_blocks_image_text_image_idx" ON "_sectors_v_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "_sectors_v_blocks_image_text_locales_locale_parent_id_unique" ON "_sectors_v_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_image_text_locales_parent_id_idx" ON "_sectors_v_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_text_section_order_idx" ON "_sectors_v_blocks_text_section" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_text_section_parent_id_idx" ON "_sectors_v_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_text_section_path_idx" ON "_sectors_v_blocks_text_section" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_text_section_locales_locale_parent_id_uniq" ON "_sectors_v_blocks_text_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_text_section_locales_parent_id_idx" ON "_sectors_v_blocks_text_section_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_contact_info_order_idx" ON "_sectors_v_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_contact_info_parent_id_idx" ON "_sectors_v_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_contact_info_path_idx" ON "_sectors_v_blocks_contact_info" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_contact_info_locales_locale_parent_id_uniq" ON "_sectors_v_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_contact_info_locales_parent_id_idx" ON "_sectors_v_blocks_contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_enquiry_form_order_idx" ON "_sectors_v_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "_sectors_v_blocks_enquiry_form_parent_id_idx" ON "_sectors_v_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_blocks_enquiry_form_path_idx" ON "_sectors_v_blocks_enquiry_form" USING btree ("_path");
  CREATE UNIQUE INDEX "_sectors_v_blocks_enquiry_form_locales_locale_parent_id_uniq" ON "_sectors_v_blocks_enquiry_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_blocks_enquiry_form_locales_parent_id_idx" ON "_sectors_v_blocks_enquiry_form_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_locales_locale_parent_id_unique" ON "pages_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_locales_parent_id_idx" ON "pages_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_intro_stats_stats_order_idx" ON "pages_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_intro_stats_stats_parent_id_idx" ON "pages_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_intro_stats_stats_locales_locale_parent_id_uniq" ON "pages_blocks_intro_stats_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_intro_stats_stats_locales_parent_id_idx" ON "pages_blocks_intro_stats_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_intro_stats_order_idx" ON "pages_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_intro_stats_parent_id_idx" ON "pages_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_intro_stats_path_idx" ON "pages_blocks_intro_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_intro_stats_locales_locale_parent_id_unique" ON "pages_blocks_intro_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_intro_stats_locales_parent_id_idx" ON "pages_blocks_intro_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_work_order_idx" ON "pages_blocks_featured_work" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_work_parent_id_idx" ON "pages_blocks_featured_work" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_work_path_idx" ON "pages_blocks_featured_work" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_featured_work_locales_locale_parent_id_unique" ON "pages_blocks_featured_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_featured_work_locales_parent_id_idx" ON "pages_blocks_featured_work_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sector_tiles_order_idx" ON "pages_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_sector_tiles_parent_id_idx" ON "pages_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sector_tiles_path_idx" ON "pages_blocks_sector_tiles" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_sector_tiles_locales_locale_parent_id_unique" ON "pages_blocks_sector_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_sector_tiles_locales_parent_id_idx" ON "pages_blocks_sector_tiles_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_list_order_idx" ON "pages_blocks_services_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_list_parent_id_idx" ON "pages_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_list_path_idx" ON "pages_blocks_services_list" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_services_list_locales_locale_parent_id_unique" ON "pages_blocks_services_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_services_list_locales_parent_id_idx" ON "pages_blocks_services_list_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_steps_order_idx" ON "pages_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_steps_parent_id_idx" ON "pages_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_process_steps_steps_locales_locale_parent_id_un" ON "pages_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_process_steps_steps_locales_parent_id_idx" ON "pages_blocks_process_steps_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_order_idx" ON "pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_parent_id_idx" ON "pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_path_idx" ON "pages_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_process_steps_locales_locale_parent_id_unique" ON "pages_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_process_steps_locales_parent_id_idx" ON "pages_blocks_process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_client_wall_order_idx" ON "pages_blocks_client_wall" USING btree ("_order");
  CREATE INDEX "pages_blocks_client_wall_parent_id_idx" ON "pages_blocks_client_wall" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_client_wall_path_idx" ON "pages_blocks_client_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_client_wall_locales_locale_parent_id_unique" ON "pages_blocks_client_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_client_wall_locales_parent_id_idx" ON "pages_blocks_client_wall_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_order_idx" ON "pages_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_parent_id_idx" ON "pages_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_path_idx" ON "pages_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_band_image_idx" ON "pages_blocks_cta_band" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_cta_band_locales_locale_parent_id_unique" ON "pages_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_band_locales_parent_id_idx" ON "pages_blocks_cta_band_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_image_idx" ON "pages_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_image_text_locales_locale_parent_id_unique" ON "pages_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_image_text_locales_parent_id_idx" ON "pages_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_section_order_idx" ON "pages_blocks_text_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_section_parent_id_idx" ON "pages_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_section_path_idx" ON "pages_blocks_text_section" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_text_section_locales_locale_parent_id_unique" ON "pages_blocks_text_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_text_section_locales_parent_id_idx" ON "pages_blocks_text_section_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_info_order_idx" ON "pages_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_info_parent_id_idx" ON "pages_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_info_path_idx" ON "pages_blocks_contact_info" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_contact_info_locales_locale_parent_id_unique" ON "pages_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_contact_info_locales_parent_id_idx" ON "pages_blocks_contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_enquiry_form_order_idx" ON "pages_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_enquiry_form_parent_id_idx" ON "pages_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_enquiry_form_path_idx" ON "pages_blocks_enquiry_form" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_enquiry_form_locales_locale_parent_id_unique" ON "pages_blocks_enquiry_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_enquiry_form_locales_parent_id_idx" ON "pages_blocks_enquiry_form_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id");
  CREATE INDEX "pages_rels_sectors_id_idx" ON "pages_rels" USING btree ("sectors_id");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "pages_rels_clients_id_idx" ON "pages_rels" USING btree ("clients_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_locales_parent_id_idx" ON "_pages_v_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_stats_stats_order_idx" ON "_pages_v_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_intro_stats_stats_parent_id_idx" ON "_pages_v_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_intro_stats_stats_locales_locale_parent_id_u" ON "_pages_v_blocks_intro_stats_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_stats_stats_locales_parent_id_idx" ON "_pages_v_blocks_intro_stats_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_stats_order_idx" ON "_pages_v_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_intro_stats_parent_id_idx" ON "_pages_v_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_stats_path_idx" ON "_pages_v_blocks_intro_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_intro_stats_locales_locale_parent_id_unique" ON "_pages_v_blocks_intro_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_intro_stats_locales_parent_id_idx" ON "_pages_v_blocks_intro_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_work_order_idx" ON "_pages_v_blocks_featured_work" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_featured_work_parent_id_idx" ON "_pages_v_blocks_featured_work" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_work_path_idx" ON "_pages_v_blocks_featured_work" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_featured_work_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_featured_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_work_locales_parent_id_idx" ON "_pages_v_blocks_featured_work_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sector_tiles_order_idx" ON "_pages_v_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sector_tiles_parent_id_idx" ON "_pages_v_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sector_tiles_path_idx" ON "_pages_v_blocks_sector_tiles" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_sector_tiles_locales_locale_parent_id_unique" ON "_pages_v_blocks_sector_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_sector_tiles_locales_parent_id_idx" ON "_pages_v_blocks_sector_tiles_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_list_order_idx" ON "_pages_v_blocks_services_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_list_parent_id_idx" ON "_pages_v_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_list_path_idx" ON "_pages_v_blocks_services_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_services_list_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_services_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_services_list_locales_parent_id_idx" ON "_pages_v_blocks_services_list_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_order_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_parent_id_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_process_steps_steps_locales_locale_parent_id" ON "_pages_v_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_locales_parent_id_idx" ON "_pages_v_blocks_process_steps_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_order_idx" ON "_pages_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_parent_id_idx" ON "_pages_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_path_idx" ON "_pages_v_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_process_steps_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_locales_parent_id_idx" ON "_pages_v_blocks_process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_client_wall_order_idx" ON "_pages_v_blocks_client_wall" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_client_wall_parent_id_idx" ON "_pages_v_blocks_client_wall" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_client_wall_path_idx" ON "_pages_v_blocks_client_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_client_wall_locales_locale_parent_id_unique" ON "_pages_v_blocks_client_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_client_wall_locales_parent_id_idx" ON "_pages_v_blocks_client_wall_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_order_idx" ON "_pages_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_parent_id_idx" ON "_pages_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_path_idx" ON "_pages_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_band_image_idx" ON "_pages_v_blocks_cta_band" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_band_locales_locale_parent_id_unique" ON "_pages_v_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_locales_parent_id_idx" ON "_pages_v_blocks_cta_band_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_order_idx" ON "_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_text_parent_id_idx" ON "_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_path_idx" ON "_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_image_idx" ON "_pages_v_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_image_text_locales_locale_parent_id_unique" ON "_pages_v_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_locales_parent_id_idx" ON "_pages_v_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_section_order_idx" ON "_pages_v_blocks_text_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_section_parent_id_idx" ON "_pages_v_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_section_path_idx" ON "_pages_v_blocks_text_section" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_text_section_locales_locale_parent_id_unique" ON "_pages_v_blocks_text_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_text_section_locales_parent_id_idx" ON "_pages_v_blocks_text_section_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_order_idx" ON "_pages_v_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_info_parent_id_idx" ON "_pages_v_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_path_idx" ON "_pages_v_blocks_contact_info" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_contact_info_locales_locale_parent_id_unique" ON "_pages_v_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_info_locales_parent_id_idx" ON "_pages_v_blocks_contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_enquiry_form_order_idx" ON "_pages_v_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_enquiry_form_parent_id_idx" ON "_pages_v_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_enquiry_form_path_idx" ON "_pages_v_blocks_enquiry_form" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_enquiry_form_locales_locale_parent_id_unique" ON "_pages_v_blocks_enquiry_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_enquiry_form_locales_parent_id_idx" ON "_pages_v_blocks_enquiry_form_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id");
  CREATE INDEX "_pages_v_rels_sectors_id_idx" ON "_pages_v_rels" USING btree ("sectors_id");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_rels_clients_id_idx" ON "_pages_v_rels" USING btree ("clients_id");
  CREATE INDEX "home_page_blocks_hero_order_idx" ON "home_page_blocks_hero" USING btree ("_order");
  CREATE INDEX "home_page_blocks_hero_parent_id_idx" ON "home_page_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_hero_path_idx" ON "home_page_blocks_hero" USING btree ("_path");
  CREATE INDEX "home_page_blocks_hero_image_idx" ON "home_page_blocks_hero" USING btree ("image_id");
  CREATE UNIQUE INDEX "home_page_blocks_hero_locales_locale_parent_id_unique" ON "home_page_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_hero_locales_parent_id_idx" ON "home_page_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_intro_stats_stats_order_idx" ON "home_page_blocks_intro_stats_stats" USING btree ("_order");
  CREATE INDEX "home_page_blocks_intro_stats_stats_parent_id_idx" ON "home_page_blocks_intro_stats_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_page_blocks_intro_stats_stats_locales_locale_parent_id_" ON "home_page_blocks_intro_stats_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_intro_stats_stats_locales_parent_id_idx" ON "home_page_blocks_intro_stats_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_intro_stats_order_idx" ON "home_page_blocks_intro_stats" USING btree ("_order");
  CREATE INDEX "home_page_blocks_intro_stats_parent_id_idx" ON "home_page_blocks_intro_stats" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_intro_stats_path_idx" ON "home_page_blocks_intro_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_intro_stats_locales_locale_parent_id_unique" ON "home_page_blocks_intro_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_intro_stats_locales_parent_id_idx" ON "home_page_blocks_intro_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_featured_work_order_idx" ON "home_page_blocks_featured_work" USING btree ("_order");
  CREATE INDEX "home_page_blocks_featured_work_parent_id_idx" ON "home_page_blocks_featured_work" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_featured_work_path_idx" ON "home_page_blocks_featured_work" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_featured_work_locales_locale_parent_id_uniq" ON "home_page_blocks_featured_work_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_featured_work_locales_parent_id_idx" ON "home_page_blocks_featured_work_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_sector_tiles_order_idx" ON "home_page_blocks_sector_tiles" USING btree ("_order");
  CREATE INDEX "home_page_blocks_sector_tiles_parent_id_idx" ON "home_page_blocks_sector_tiles" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_sector_tiles_path_idx" ON "home_page_blocks_sector_tiles" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_sector_tiles_locales_locale_parent_id_uniqu" ON "home_page_blocks_sector_tiles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_sector_tiles_locales_parent_id_idx" ON "home_page_blocks_sector_tiles_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_services_list_order_idx" ON "home_page_blocks_services_list" USING btree ("_order");
  CREATE INDEX "home_page_blocks_services_list_parent_id_idx" ON "home_page_blocks_services_list" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_services_list_path_idx" ON "home_page_blocks_services_list" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_services_list_locales_locale_parent_id_uniq" ON "home_page_blocks_services_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_services_list_locales_parent_id_idx" ON "home_page_blocks_services_list_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_process_steps_steps_order_idx" ON "home_page_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "home_page_blocks_process_steps_steps_parent_id_idx" ON "home_page_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_page_blocks_process_steps_steps_locales_locale_parent_i" ON "home_page_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_process_steps_steps_locales_parent_id_idx" ON "home_page_blocks_process_steps_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_process_steps_order_idx" ON "home_page_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "home_page_blocks_process_steps_parent_id_idx" ON "home_page_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_process_steps_path_idx" ON "home_page_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_process_steps_locales_locale_parent_id_uniq" ON "home_page_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_process_steps_locales_parent_id_idx" ON "home_page_blocks_process_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_client_wall_order_idx" ON "home_page_blocks_client_wall" USING btree ("_order");
  CREATE INDEX "home_page_blocks_client_wall_parent_id_idx" ON "home_page_blocks_client_wall" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_client_wall_path_idx" ON "home_page_blocks_client_wall" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_client_wall_locales_locale_parent_id_unique" ON "home_page_blocks_client_wall_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_client_wall_locales_parent_id_idx" ON "home_page_blocks_client_wall_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_cta_band_order_idx" ON "home_page_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "home_page_blocks_cta_band_parent_id_idx" ON "home_page_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_cta_band_path_idx" ON "home_page_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "home_page_blocks_cta_band_image_idx" ON "home_page_blocks_cta_band" USING btree ("image_id");
  CREATE UNIQUE INDEX "home_page_blocks_cta_band_locales_locale_parent_id_unique" ON "home_page_blocks_cta_band_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_cta_band_locales_parent_id_idx" ON "home_page_blocks_cta_band_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_image_text_order_idx" ON "home_page_blocks_image_text" USING btree ("_order");
  CREATE INDEX "home_page_blocks_image_text_parent_id_idx" ON "home_page_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_image_text_path_idx" ON "home_page_blocks_image_text" USING btree ("_path");
  CREATE INDEX "home_page_blocks_image_text_image_idx" ON "home_page_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "home_page_blocks_image_text_locales_locale_parent_id_unique" ON "home_page_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_image_text_locales_parent_id_idx" ON "home_page_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_text_section_order_idx" ON "home_page_blocks_text_section" USING btree ("_order");
  CREATE INDEX "home_page_blocks_text_section_parent_id_idx" ON "home_page_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_text_section_path_idx" ON "home_page_blocks_text_section" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_text_section_locales_locale_parent_id_uniqu" ON "home_page_blocks_text_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_text_section_locales_parent_id_idx" ON "home_page_blocks_text_section_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_contact_info_order_idx" ON "home_page_blocks_contact_info" USING btree ("_order");
  CREATE INDEX "home_page_blocks_contact_info_parent_id_idx" ON "home_page_blocks_contact_info" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_contact_info_path_idx" ON "home_page_blocks_contact_info" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_contact_info_locales_locale_parent_id_uniqu" ON "home_page_blocks_contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_contact_info_locales_parent_id_idx" ON "home_page_blocks_contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_enquiry_form_order_idx" ON "home_page_blocks_enquiry_form" USING btree ("_order");
  CREATE INDEX "home_page_blocks_enquiry_form_parent_id_idx" ON "home_page_blocks_enquiry_form" USING btree ("_parent_id");
  CREATE INDEX "home_page_blocks_enquiry_form_path_idx" ON "home_page_blocks_enquiry_form" USING btree ("_path");
  CREATE UNIQUE INDEX "home_page_blocks_enquiry_form_locales_locale_parent_id_uniqu" ON "home_page_blocks_enquiry_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_blocks_enquiry_form_locales_parent_id_idx" ON "home_page_blocks_enquiry_form_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_seo_seo_og_image_idx" ON "home_page" USING btree ("seo_og_image_id");
  CREATE UNIQUE INDEX "home_page_locales_locale_parent_id_unique" ON "home_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_locales_parent_id_idx" ON "home_page_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_projects_id_idx" ON "home_page_rels" USING btree ("projects_id");
  CREATE INDEX "home_page_rels_sectors_id_idx" ON "home_page_rels" USING btree ("sectors_id");
  CREATE INDEX "home_page_rels_services_id_idx" ON "home_page_rels" USING btree ("services_id");
  CREATE INDEX "home_page_rels_clients_id_idx" ON "home_page_rels" USING btree ("clients_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_links_locales_locale_parent_id_unique" ON "footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_links_locales_parent_id_idx" ON "footer_columns_links_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_locales_parent_id_idx" ON "footer_columns_locales" USING btree ("_parent_id");
  ALTER TABLE "services" ADD CONSTRAINT "services_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_sector_id_sectors_id_fk" FOREIGN KEY ("version_sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_rels" ADD CONSTRAINT "_sectors_v_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_rels" ADD CONSTRAINT "_sectors_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_rels" ADD CONSTRAINT "_sectors_v_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_footer_logo_id_media_id_fk" FOREIGN KEY ("footer_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_sector_idx" ON "services" USING btree ("sector_id");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE INDEX "services_rels_sectors_id_idx" ON "services_rels" USING btree ("sectors_id");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE INDEX "services_rels_clients_id_idx" ON "services_rels" USING btree ("clients_id");
  CREATE INDEX "_services_v_version_version_sector_idx" ON "_services_v" USING btree ("version_sector_id");
  CREATE INDEX "_services_v_version_version_image_idx" ON "_services_v" USING btree ("version_image_id");
  CREATE INDEX "_services_v_rels_sectors_id_idx" ON "_services_v_rels" USING btree ("sectors_id");
  CREATE INDEX "_services_v_rels_services_id_idx" ON "_services_v_rels" USING btree ("services_id");
  CREATE INDEX "_services_v_rels_clients_id_idx" ON "_services_v_rels" USING btree ("clients_id");
  CREATE INDEX "sectors_rels_sectors_id_idx" ON "sectors_rels" USING btree ("sectors_id");
  CREATE INDEX "sectors_rels_services_id_idx" ON "sectors_rels" USING btree ("services_id");
  CREATE INDEX "sectors_rels_clients_id_idx" ON "sectors_rels" USING btree ("clients_id");
  CREATE INDEX "_sectors_v_rels_sectors_id_idx" ON "_sectors_v_rels" USING btree ("sectors_id");
  CREATE INDEX "_sectors_v_rels_services_id_idx" ON "_sectors_v_rels" USING btree ("services_id");
  CREATE INDEX "_sectors_v_rels_clients_id_idx" ON "_sectors_v_rels" USING btree ("clients_id");
  CREATE INDEX "site_settings_footer_logo_idx" ON "site_settings" USING btree ("footer_logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_intro_stats_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_intro_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_featured_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_featured_work_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_sector_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_sector_tiles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_services_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_services_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_process_steps_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_client_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_client_wall_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta_band_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_text_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_enquiry_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_enquiry_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_intro_stats_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_intro_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_featured_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_featured_work_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_sector_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_sector_tiles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_services_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_services_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_process_steps_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_client_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_client_wall_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cta_band_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_text_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_enquiry_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_enquiry_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_intro_stats_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_intro_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_featured_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_featured_work_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_sector_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_sector_tiles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_services_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_services_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_process_steps_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_client_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_client_wall_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_cta_band_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_image_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_text_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_enquiry_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_blocks_enquiry_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_intro_stats_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_intro_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_featured_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_featured_work_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_sector_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_sector_tiles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_services_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_services_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_process_steps_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_client_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_client_wall_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_cta_band_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_image_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_text_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_enquiry_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_blocks_enquiry_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_intro_stats_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_intro_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_featured_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_featured_work_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_sector_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_sector_tiles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_client_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_client_wall_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_band_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_enquiry_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_enquiry_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_intro_stats_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_intro_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_featured_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_featured_work_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_sector_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_sector_tiles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_client_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_client_wall_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_band_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_enquiry_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_enquiry_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_intro_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_intro_stats_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_intro_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_intro_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_featured_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_featured_work_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_sector_tiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_sector_tiles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_services_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_services_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_process_steps_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_client_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_client_wall_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_cta_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_cta_band_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_image_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_image_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_text_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_text_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_enquiry_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_blocks_enquiry_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_blocks_hero" CASCADE;
  DROP TABLE "services_blocks_hero_locales" CASCADE;
  DROP TABLE "services_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "services_blocks_intro_stats_stats_locales" CASCADE;
  DROP TABLE "services_blocks_intro_stats" CASCADE;
  DROP TABLE "services_blocks_intro_stats_locales" CASCADE;
  DROP TABLE "services_blocks_featured_work" CASCADE;
  DROP TABLE "services_blocks_featured_work_locales" CASCADE;
  DROP TABLE "services_blocks_sector_tiles" CASCADE;
  DROP TABLE "services_blocks_sector_tiles_locales" CASCADE;
  DROP TABLE "services_blocks_services_list" CASCADE;
  DROP TABLE "services_blocks_services_list_locales" CASCADE;
  DROP TABLE "services_blocks_process_steps_steps" CASCADE;
  DROP TABLE "services_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "services_blocks_process_steps" CASCADE;
  DROP TABLE "services_blocks_process_steps_locales" CASCADE;
  DROP TABLE "services_blocks_client_wall" CASCADE;
  DROP TABLE "services_blocks_client_wall_locales" CASCADE;
  DROP TABLE "services_blocks_cta_band" CASCADE;
  DROP TABLE "services_blocks_cta_band_locales" CASCADE;
  DROP TABLE "services_blocks_image_text" CASCADE;
  DROP TABLE "services_blocks_image_text_locales" CASCADE;
  DROP TABLE "services_blocks_text_section" CASCADE;
  DROP TABLE "services_blocks_text_section_locales" CASCADE;
  DROP TABLE "services_blocks_contact_info" CASCADE;
  DROP TABLE "services_blocks_contact_info_locales" CASCADE;
  DROP TABLE "services_blocks_enquiry_form" CASCADE;
  DROP TABLE "services_blocks_enquiry_form_locales" CASCADE;
  DROP TABLE "_services_v_blocks_hero" CASCADE;
  DROP TABLE "_services_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_services_v_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "_services_v_blocks_intro_stats_stats_locales" CASCADE;
  DROP TABLE "_services_v_blocks_intro_stats" CASCADE;
  DROP TABLE "_services_v_blocks_intro_stats_locales" CASCADE;
  DROP TABLE "_services_v_blocks_featured_work" CASCADE;
  DROP TABLE "_services_v_blocks_featured_work_locales" CASCADE;
  DROP TABLE "_services_v_blocks_sector_tiles" CASCADE;
  DROP TABLE "_services_v_blocks_sector_tiles_locales" CASCADE;
  DROP TABLE "_services_v_blocks_services_list" CASCADE;
  DROP TABLE "_services_v_blocks_services_list_locales" CASCADE;
  DROP TABLE "_services_v_blocks_process_steps_steps" CASCADE;
  DROP TABLE "_services_v_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "_services_v_blocks_process_steps" CASCADE;
  DROP TABLE "_services_v_blocks_process_steps_locales" CASCADE;
  DROP TABLE "_services_v_blocks_client_wall" CASCADE;
  DROP TABLE "_services_v_blocks_client_wall_locales" CASCADE;
  DROP TABLE "_services_v_blocks_cta_band" CASCADE;
  DROP TABLE "_services_v_blocks_cta_band_locales" CASCADE;
  DROP TABLE "_services_v_blocks_image_text" CASCADE;
  DROP TABLE "_services_v_blocks_image_text_locales" CASCADE;
  DROP TABLE "_services_v_blocks_text_section" CASCADE;
  DROP TABLE "_services_v_blocks_text_section_locales" CASCADE;
  DROP TABLE "_services_v_blocks_contact_info" CASCADE;
  DROP TABLE "_services_v_blocks_contact_info_locales" CASCADE;
  DROP TABLE "_services_v_blocks_enquiry_form" CASCADE;
  DROP TABLE "_services_v_blocks_enquiry_form_locales" CASCADE;
  DROP TABLE "sectors_blocks_hero" CASCADE;
  DROP TABLE "sectors_blocks_hero_locales" CASCADE;
  DROP TABLE "sectors_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "sectors_blocks_intro_stats_stats_locales" CASCADE;
  DROP TABLE "sectors_blocks_intro_stats" CASCADE;
  DROP TABLE "sectors_blocks_intro_stats_locales" CASCADE;
  DROP TABLE "sectors_blocks_featured_work" CASCADE;
  DROP TABLE "sectors_blocks_featured_work_locales" CASCADE;
  DROP TABLE "sectors_blocks_sector_tiles" CASCADE;
  DROP TABLE "sectors_blocks_sector_tiles_locales" CASCADE;
  DROP TABLE "sectors_blocks_services_list" CASCADE;
  DROP TABLE "sectors_blocks_services_list_locales" CASCADE;
  DROP TABLE "sectors_blocks_process_steps_steps" CASCADE;
  DROP TABLE "sectors_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "sectors_blocks_process_steps" CASCADE;
  DROP TABLE "sectors_blocks_process_steps_locales" CASCADE;
  DROP TABLE "sectors_blocks_client_wall" CASCADE;
  DROP TABLE "sectors_blocks_client_wall_locales" CASCADE;
  DROP TABLE "sectors_blocks_cta_band" CASCADE;
  DROP TABLE "sectors_blocks_cta_band_locales" CASCADE;
  DROP TABLE "sectors_blocks_image_text" CASCADE;
  DROP TABLE "sectors_blocks_image_text_locales" CASCADE;
  DROP TABLE "sectors_blocks_text_section" CASCADE;
  DROP TABLE "sectors_blocks_text_section_locales" CASCADE;
  DROP TABLE "sectors_blocks_contact_info" CASCADE;
  DROP TABLE "sectors_blocks_contact_info_locales" CASCADE;
  DROP TABLE "sectors_blocks_enquiry_form" CASCADE;
  DROP TABLE "sectors_blocks_enquiry_form_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_hero" CASCADE;
  DROP TABLE "_sectors_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "_sectors_v_blocks_intro_stats_stats_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_intro_stats" CASCADE;
  DROP TABLE "_sectors_v_blocks_intro_stats_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_featured_work" CASCADE;
  DROP TABLE "_sectors_v_blocks_featured_work_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_sector_tiles" CASCADE;
  DROP TABLE "_sectors_v_blocks_sector_tiles_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_services_list" CASCADE;
  DROP TABLE "_sectors_v_blocks_services_list_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_process_steps_steps" CASCADE;
  DROP TABLE "_sectors_v_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_process_steps" CASCADE;
  DROP TABLE "_sectors_v_blocks_process_steps_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_client_wall" CASCADE;
  DROP TABLE "_sectors_v_blocks_client_wall_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_cta_band" CASCADE;
  DROP TABLE "_sectors_v_blocks_cta_band_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_image_text" CASCADE;
  DROP TABLE "_sectors_v_blocks_image_text_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_text_section" CASCADE;
  DROP TABLE "_sectors_v_blocks_text_section_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_contact_info" CASCADE;
  DROP TABLE "_sectors_v_blocks_contact_info_locales" CASCADE;
  DROP TABLE "_sectors_v_blocks_enquiry_form" CASCADE;
  DROP TABLE "_sectors_v_blocks_enquiry_form_locales" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "pages_blocks_intro_stats_stats_locales" CASCADE;
  DROP TABLE "pages_blocks_intro_stats" CASCADE;
  DROP TABLE "pages_blocks_intro_stats_locales" CASCADE;
  DROP TABLE "pages_blocks_featured_work" CASCADE;
  DROP TABLE "pages_blocks_featured_work_locales" CASCADE;
  DROP TABLE "pages_blocks_sector_tiles" CASCADE;
  DROP TABLE "pages_blocks_sector_tiles_locales" CASCADE;
  DROP TABLE "pages_blocks_services_list" CASCADE;
  DROP TABLE "pages_blocks_services_list_locales" CASCADE;
  DROP TABLE "pages_blocks_process_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_process_steps" CASCADE;
  DROP TABLE "pages_blocks_process_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_client_wall" CASCADE;
  DROP TABLE "pages_blocks_client_wall_locales" CASCADE;
  DROP TABLE "pages_blocks_cta_band" CASCADE;
  DROP TABLE "pages_blocks_cta_band_locales" CASCADE;
  DROP TABLE "pages_blocks_image_text" CASCADE;
  DROP TABLE "pages_blocks_image_text_locales" CASCADE;
  DROP TABLE "pages_blocks_text_section" CASCADE;
  DROP TABLE "pages_blocks_text_section_locales" CASCADE;
  DROP TABLE "pages_blocks_contact_info" CASCADE;
  DROP TABLE "pages_blocks_contact_info_locales" CASCADE;
  DROP TABLE "pages_blocks_enquiry_form" CASCADE;
  DROP TABLE "pages_blocks_enquiry_form_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_intro_stats_stats_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_intro_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_intro_stats_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_work" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_work_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_sector_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_sector_tiles_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_services_list" CASCADE;
  DROP TABLE "_pages_v_blocks_services_list_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_client_wall" CASCADE;
  DROP TABLE "_pages_v_blocks_client_wall_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_image_text" CASCADE;
  DROP TABLE "_pages_v_blocks_image_text_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_text_section" CASCADE;
  DROP TABLE "_pages_v_blocks_text_section_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_info" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_info_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_enquiry_form" CASCADE;
  DROP TABLE "_pages_v_blocks_enquiry_form_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "home_page_blocks_hero" CASCADE;
  DROP TABLE "home_page_blocks_hero_locales" CASCADE;
  DROP TABLE "home_page_blocks_intro_stats_stats" CASCADE;
  DROP TABLE "home_page_blocks_intro_stats_stats_locales" CASCADE;
  DROP TABLE "home_page_blocks_intro_stats" CASCADE;
  DROP TABLE "home_page_blocks_intro_stats_locales" CASCADE;
  DROP TABLE "home_page_blocks_featured_work" CASCADE;
  DROP TABLE "home_page_blocks_featured_work_locales" CASCADE;
  DROP TABLE "home_page_blocks_sector_tiles" CASCADE;
  DROP TABLE "home_page_blocks_sector_tiles_locales" CASCADE;
  DROP TABLE "home_page_blocks_services_list" CASCADE;
  DROP TABLE "home_page_blocks_services_list_locales" CASCADE;
  DROP TABLE "home_page_blocks_process_steps_steps" CASCADE;
  DROP TABLE "home_page_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "home_page_blocks_process_steps" CASCADE;
  DROP TABLE "home_page_blocks_process_steps_locales" CASCADE;
  DROP TABLE "home_page_blocks_client_wall" CASCADE;
  DROP TABLE "home_page_blocks_client_wall_locales" CASCADE;
  DROP TABLE "home_page_blocks_cta_band" CASCADE;
  DROP TABLE "home_page_blocks_cta_band_locales" CASCADE;
  DROP TABLE "home_page_blocks_image_text" CASCADE;
  DROP TABLE "home_page_blocks_image_text_locales" CASCADE;
  DROP TABLE "home_page_blocks_text_section" CASCADE;
  DROP TABLE "home_page_blocks_text_section_locales" CASCADE;
  DROP TABLE "home_page_blocks_contact_info" CASCADE;
  DROP TABLE "home_page_blocks_contact_info_locales" CASCADE;
  DROP TABLE "home_page_blocks_enquiry_form" CASCADE;
  DROP TABLE "home_page_blocks_enquiry_form_locales" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_locales" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns_links_locales" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_columns_locales" CASCADE;
  ALTER TABLE "services" DROP CONSTRAINT "services_sector_id_sectors_id_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_image_id_media_id_fk";
  
  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_sectors_fk";
  
  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_services_fk";
  
  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_clients_fk";
  
  ALTER TABLE "_services_v" DROP CONSTRAINT "_services_v_version_sector_id_sectors_id_fk";
  
  ALTER TABLE "_services_v" DROP CONSTRAINT "_services_v_version_image_id_media_id_fk";
  
  ALTER TABLE "_services_v_rels" DROP CONSTRAINT "_services_v_rels_sectors_fk";
  
  ALTER TABLE "_services_v_rels" DROP CONSTRAINT "_services_v_rels_services_fk";
  
  ALTER TABLE "_services_v_rels" DROP CONSTRAINT "_services_v_rels_clients_fk";
  
  ALTER TABLE "sectors_rels" DROP CONSTRAINT "sectors_rels_sectors_fk";
  
  ALTER TABLE "sectors_rels" DROP CONSTRAINT "sectors_rels_services_fk";
  
  ALTER TABLE "sectors_rels" DROP CONSTRAINT "sectors_rels_clients_fk";
  
  ALTER TABLE "_sectors_v_rels" DROP CONSTRAINT "_sectors_v_rels_sectors_fk";
  
  ALTER TABLE "_sectors_v_rels" DROP CONSTRAINT "_sectors_v_rels_services_fk";
  
  ALTER TABLE "_sectors_v_rels" DROP CONSTRAINT "_sectors_v_rels_clients_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_footer_logo_id_media_id_fk";
  
  DROP INDEX "services_sector_idx";
  DROP INDEX "services_image_idx";
  DROP INDEX "services_rels_sectors_id_idx";
  DROP INDEX "services_rels_services_id_idx";
  DROP INDEX "services_rels_clients_id_idx";
  DROP INDEX "_services_v_version_version_sector_idx";
  DROP INDEX "_services_v_version_version_image_idx";
  DROP INDEX "_services_v_rels_sectors_id_idx";
  DROP INDEX "_services_v_rels_services_id_idx";
  DROP INDEX "_services_v_rels_clients_id_idx";
  DROP INDEX "sectors_rels_sectors_id_idx";
  DROP INDEX "sectors_rels_services_id_idx";
  DROP INDEX "sectors_rels_clients_id_idx";
  DROP INDEX "_sectors_v_rels_sectors_id_idx";
  DROP INDEX "_sectors_v_rels_services_id_idx";
  DROP INDEX "_sectors_v_rels_clients_id_idx";
  DROP INDEX "site_settings_footer_logo_idx";
  ALTER TABLE "projects" DROP COLUMN "admin_note";
  ALTER TABLE "_projects_v" DROP COLUMN "version_admin_note";
  ALTER TABLE "services" DROP COLUMN "sector_id";
  ALTER TABLE "services" DROP COLUMN "image_id";
  ALTER TABLE "services_rels" DROP COLUMN "sectors_id";
  ALTER TABLE "services_rels" DROP COLUMN "services_id";
  ALTER TABLE "services_rels" DROP COLUMN "clients_id";
  ALTER TABLE "_services_v" DROP COLUMN "version_sector_id";
  ALTER TABLE "_services_v" DROP COLUMN "version_image_id";
  ALTER TABLE "_services_v_rels" DROP COLUMN "sectors_id";
  ALTER TABLE "_services_v_rels" DROP COLUMN "services_id";
  ALTER TABLE "_services_v_rels" DROP COLUMN "clients_id";
  ALTER TABLE "sectors_rels" DROP COLUMN "sectors_id";
  ALTER TABLE "sectors_rels" DROP COLUMN "services_id";
  ALTER TABLE "sectors_rels" DROP COLUMN "clients_id";
  ALTER TABLE "_sectors_v_rels" DROP COLUMN "sectors_id";
  ALTER TABLE "_sectors_v_rels" DROP COLUMN "services_id";
  ALTER TABLE "_sectors_v_rels" DROP COLUMN "clients_id";
  ALTER TABLE "clients" DROP COLUMN "order";
  ALTER TABLE "site_settings" DROP COLUMN "footer_logo_id";
  ALTER TABLE "site_settings" DROP COLUMN "cta_link";
  ALTER TABLE "site_settings_locales" DROP COLUMN "tagline";
  ALTER TABLE "site_settings_locales" DROP COLUMN "cta_label";
  ALTER TABLE "contact_info" DROP COLUMN "sales_email_fact_key";
  DROP TYPE "public"."enum_services_blocks_hero_size";
  DROP TYPE "public"."enum_services_blocks_process_steps_tone";
  DROP TYPE "public"."enum_services_blocks_image_text_image_side";
  DROP TYPE "public"."enum_services_blocks_text_section_columns";
  DROP TYPE "public"."enum_services_blocks_enquiry_form_form";
  DROP TYPE "public"."enum__services_v_blocks_hero_size";
  DROP TYPE "public"."enum__services_v_blocks_process_steps_tone";
  DROP TYPE "public"."enum__services_v_blocks_image_text_image_side";
  DROP TYPE "public"."enum__services_v_blocks_text_section_columns";
  DROP TYPE "public"."enum__services_v_blocks_enquiry_form_form";
  DROP TYPE "public"."enum_sectors_blocks_hero_size";
  DROP TYPE "public"."enum_sectors_blocks_process_steps_tone";
  DROP TYPE "public"."enum_sectors_blocks_image_text_image_side";
  DROP TYPE "public"."enum_sectors_blocks_text_section_columns";
  DROP TYPE "public"."enum_sectors_blocks_enquiry_form_form";
  DROP TYPE "public"."enum__sectors_v_blocks_hero_size";
  DROP TYPE "public"."enum__sectors_v_blocks_process_steps_tone";
  DROP TYPE "public"."enum__sectors_v_blocks_image_text_image_side";
  DROP TYPE "public"."enum__sectors_v_blocks_text_section_columns";
  DROP TYPE "public"."enum__sectors_v_blocks_enquiry_form_form";
  DROP TYPE "public"."enum_pages_blocks_hero_size";
  DROP TYPE "public"."enum_pages_blocks_process_steps_tone";
  DROP TYPE "public"."enum_pages_blocks_image_text_image_side";
  DROP TYPE "public"."enum_pages_blocks_text_section_columns";
  DROP TYPE "public"."enum_pages_blocks_enquiry_form_form";
  DROP TYPE "public"."enum__pages_v_blocks_hero_size";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_tone";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_image_side";
  DROP TYPE "public"."enum__pages_v_blocks_text_section_columns";
  DROP TYPE "public"."enum__pages_v_blocks_enquiry_form_form";
  DROP TYPE "public"."enum_home_page_blocks_hero_size";
  DROP TYPE "public"."enum_home_page_blocks_process_steps_tone";
  DROP TYPE "public"."enum_home_page_blocks_image_text_image_side";
  DROP TYPE "public"."enum_home_page_blocks_text_section_columns";
  DROP TYPE "public"."enum_home_page_blocks_enquiry_form_form";`)
}

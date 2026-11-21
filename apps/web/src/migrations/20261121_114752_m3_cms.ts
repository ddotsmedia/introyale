import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_users_role" AS ENUM('administrator', 'content_editor', 'project_editor', 'marketing_reviewer', 'publisher');
  CREATE TYPE "public"."enum_projects_stage" AS ENUM('concept', 'design', 'delivery', 'completed');
  CREATE TYPE "public"."enum_projects_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_stage" AS ENUM('concept', 'design', 'delivery', 'completed');
  CREATE TYPE "public"."enum__projects_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_services_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_sectors_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum_sectors_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sectors_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum__sectors_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sectors_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_team_members_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_testimonials_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_journal_posts_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum_journal_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__journal_posts_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum__journal_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__journal_posts_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_pages_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_workflow_status" AS ENUM('draft', 'in_review', 'approved', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_facts_status" AS ENUM('unverified', 'verified', 'retired');
  CREATE TYPE "public"."enum_enquiries_type" AS ENUM('consultation', 'general');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302', '410');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "users_totp_recovery_codes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hash" varchar NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"usage_approved" boolean DEFAULT false,
  	"usage_approved_by_id" integer,
  	"confidential" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_w480_url" varchar,
  	"sizes_w480_width" numeric,
  	"sizes_w480_height" numeric,
  	"sizes_w480_mime_type" varchar,
  	"sizes_w480_filesize" numeric,
  	"sizes_w480_filename" varchar,
  	"sizes_w768_url" varchar,
  	"sizes_w768_width" numeric,
  	"sizes_w768_height" numeric,
  	"sizes_w768_mime_type" varchar,
  	"sizes_w768_filesize" numeric,
  	"sizes_w768_filename" varchar,
  	"sizes_w1080_url" varchar,
  	"sizes_w1080_width" numeric,
  	"sizes_w1080_height" numeric,
  	"sizes_w1080_mime_type" varchar,
  	"sizes_w1080_filesize" numeric,
  	"sizes_w1080_filename" varchar,
  	"sizes_w1440_url" varchar,
  	"sizes_w1440_width" numeric,
  	"sizes_w1440_height" numeric,
  	"sizes_w1440_mime_type" varchar,
  	"sizes_w1440_filesize" numeric,
  	"sizes_w1440_filename" varchar,
  	"sizes_w1920_url" varchar,
  	"sizes_w1920_width" numeric,
  	"sizes_w1920_height" numeric,
  	"sizes_w1920_mime_type" varchar,
  	"sizes_w1920_filesize" numeric,
  	"sizes_w1920_filename" varchar,
  	"sizes_w2560_url" varchar,
  	"sizes_w2560_width" numeric,
  	"sizes_w2560_height" numeric,
  	"sizes_w2560_mime_type" varchar,
  	"sizes_w2560_filesize" numeric,
  	"sizes_w2560_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer
  );
  
  CREATE TABLE "projects_before_after_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_plans_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"x" numeric,
  	"y" numeric,
  	"media_id" integer
  );
  
  CREATE TABLE "projects_plans_hotspots_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"sector_id" integer,
  	"property_type_id" integer,
  	"area_label" varchar,
  	"year" numeric,
  	"approx_area_sqm" numeric,
  	"stage" "enum_projects_stage",
  	"hero_id" integer,
  	"testimonial_id" integer,
  	"featured" boolean DEFAULT false,
  	"client_approval_approved" boolean DEFAULT false,
  	"client_approval_approved_by" varchar,
  	"client_approval_date" timestamp(3) with time zone,
  	"client_approval_evidence" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_override" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"workflow_status" "enum_projects_workflow_status" DEFAULT 'draft',
  	"workflow_submitted_by_id" integer,
  	"workflow_reviewed_by_id" integer,
  	"workflow_approved_by_id" integer,
  	"workflow_published_by_id" integer,
  	"workflow_review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"public_title" varchar,
  	"brief" varchar,
  	"constraints" varchar,
  	"concept" varchar,
  	"space_planning" varchar,
  	"materials" varchar,
  	"joinery" varchar,
  	"technical_mep" varchar,
  	"delivery_model" varchar,
  	"timeline_label" varchar,
  	"outcome" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"media_id" integer,
  	"team_members_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "_projects_v_version_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_before_after_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_plans_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"x" numeric,
  	"y" numeric,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_plans_hotspots_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_sector_id" integer,
  	"version_property_type_id" integer,
  	"version_area_label" varchar,
  	"version_year" numeric,
  	"version_approx_area_sqm" numeric,
  	"version_stage" "enum__projects_v_version_stage",
  	"version_hero_id" integer,
  	"version_testimonial_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_client_approval_approved" boolean DEFAULT false,
  	"version_client_approval_approved_by" varchar,
  	"version_client_approval_date" timestamp(3) with time zone,
  	"version_client_approval_evidence" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_override" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_workflow_status" "enum__projects_v_version_workflow_status" DEFAULT 'draft',
  	"version_workflow_submitted_by_id" integer,
  	"version_workflow_reviewed_by_id" integer,
  	"version_workflow_approved_by_id" integer,
  	"version_workflow_published_by_id" integer,
  	"version_workflow_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_public_title" varchar,
  	"version_brief" varchar,
  	"version_constraints" varchar,
  	"version_concept" varchar,
  	"version_space_planning" varchar,
  	"version_materials" varchar,
  	"version_joinery" varchar,
  	"version_technical_mep" varchar,
  	"version_delivery_model" varchar,
  	"version_timeline_label" varchar,
  	"version_outcome" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"media_id" integer,
  	"team_members_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "services_scope" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "services_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "services_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"confirmed" boolean DEFAULT false,
  	"seo_og_image_id" integer,
  	"seo_canonical_override" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"workflow_status" "enum_services_workflow_status" DEFAULT 'draft',
  	"workflow_submitted_by_id" integer,
  	"workflow_reviewed_by_id" integer,
  	"workflow_approved_by_id" integer,
  	"workflow_published_by_id" integer,
  	"workflow_review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"audience" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "_services_v_version_scope" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_confirmed" boolean DEFAULT false,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_override" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_workflow_status" "enum__services_v_version_workflow_status" DEFAULT 'draft',
  	"version_workflow_submitted_by_id" integer,
  	"version_workflow_reviewed_by_id" integer,
  	"version_workflow_approved_by_id" integer,
  	"version_workflow_published_by_id" integer,
  	"version_workflow_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_audience" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "sectors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"hero_id" integer,
  	"seo_og_image_id" integer,
  	"seo_canonical_override" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"workflow_status" "enum_sectors_workflow_status" DEFAULT 'draft',
  	"workflow_submitted_by_id" integer,
  	"workflow_reviewed_by_id" integer,
  	"workflow_approved_by_id" integer,
  	"workflow_published_by_id" integer,
  	"workflow_review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sectors_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "sectors_locales" (
  	"title" varchar,
  	"intro" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sectors_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "_sectors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_hero_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_override" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_workflow_status" "enum__sectors_v_version_workflow_status" DEFAULT 'draft',
  	"version_workflow_submitted_by_id" integer,
  	"version_workflow_reviewed_by_id" integer,
  	"version_workflow_approved_by_id" integer,
  	"version_workflow_published_by_id" integer,
  	"version_workflow_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sectors_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__sectors_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_sectors_v_locales" (
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_sectors_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "property_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"sector_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "property_types_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "team_members_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0,
  	"consent_given" boolean DEFAULT false,
  	"consent_date" timestamp(3) with time zone,
  	"consent_evidence" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_override" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"workflow_status" "enum_team_members_workflow_status" DEFAULT 'draft',
  	"workflow_submitted_by_id" integer,
  	"workflow_reviewed_by_id" integer,
  	"workflow_approved_by_id" integer,
  	"workflow_published_by_id" integer,
  	"workflow_review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "team_members_locales" (
  	"role" varchar,
  	"bio" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_team_members_v_version_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_photo_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_consent_given" boolean DEFAULT false,
  	"version_consent_date" timestamp(3) with time zone,
  	"version_consent_evidence" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_override" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_workflow_status" "enum__team_members_v_version_workflow_status" DEFAULT 'draft',
  	"version_workflow_submitted_by_id" integer,
  	"version_workflow_reviewed_by_id" integer,
  	"version_workflow_approved_by_id" integer,
  	"version_workflow_published_by_id" integer,
  	"version_workflow_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__team_members_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_team_members_v_locales" (
  	"version_role" varchar,
  	"version_bio" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"attribution_name" varchar,
  	"attribution_role" varchar,
  	"project_id" integer,
  	"permission_given" boolean DEFAULT false,
  	"permission_evidence" varchar,
  	"workflow_status" "enum_testimonials_workflow_status" DEFAULT 'draft',
  	"workflow_submitted_by_id" integer,
  	"workflow_reviewed_by_id" integer,
  	"workflow_approved_by_id" integer,
  	"workflow_published_by_id" integer,
  	"workflow_review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "testimonials_locales" (
  	"quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_attribution_name" varchar,
  	"version_attribution_role" varchar,
  	"version_project_id" integer,
  	"version_permission_given" boolean DEFAULT false,
  	"version_permission_evidence" varchar,
  	"version_workflow_status" "enum__testimonials_v_version_workflow_status" DEFAULT 'draft',
  	"version_workflow_submitted_by_id" integer,
  	"version_workflow_reviewed_by_id" integer,
  	"version_workflow_approved_by_id" integer,
  	"version_workflow_published_by_id" integer,
  	"version_workflow_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__testimonials_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_testimonials_v_locales" (
  	"version_quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"sector_id" integer,
  	"logo_permission" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"issuer" varchar,
  	"year" numeric,
  	"evidence_url" varchar,
  	"evidence_file_id" integer,
  	"project_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "journal_posts_citations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "journal_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"author_id" integer,
  	"hero_image_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_canonical_override" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"workflow_status" "enum_journal_posts_workflow_status" DEFAULT 'draft',
  	"workflow_submitted_by_id" integer,
  	"workflow_reviewed_by_id" integer,
  	"workflow_approved_by_id" integer,
  	"workflow_published_by_id" integer,
  	"workflow_review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_journal_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "journal_posts_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "journal_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"journal_categories_id" integer,
  	"projects_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "_journal_posts_v_version_citations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_journal_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_author_id" integer,
  	"version_hero_image_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_override" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_workflow_status" "enum__journal_posts_v_version_workflow_status" DEFAULT 'draft',
  	"version_workflow_submitted_by_id" integer,
  	"version_workflow_reviewed_by_id" integer,
  	"version_workflow_approved_by_id" integer,
  	"version_workflow_published_by_id" integer,
  	"version_workflow_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__journal_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__journal_posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_journal_posts_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_journal_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"journal_categories_id" integer,
  	"projects_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "journal_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "journal_categories_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" varchar,
  	"eligible_for_schema" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"seo_og_image_id" integer,
  	"seo_canonical_override" varchar,
  	"seo_noindex" boolean DEFAULT false,
  	"workflow_status" "enum_pages_workflow_status" DEFAULT 'draft',
  	"workflow_submitted_by_id" integer,
  	"workflow_reviewed_by_id" integer,
  	"workflow_approved_by_id" integer,
  	"workflow_published_by_id" integer,
  	"workflow_review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"body" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_canonical_override" varchar,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_workflow_status" "enum__pages_v_version_workflow_status" DEFAULT 'draft',
  	"version_workflow_submitted_by_id" integer,
  	"version_workflow_reviewed_by_id" integer,
  	"version_workflow_approved_by_id" integer,
  	"version_workflow_published_by_id" integer,
  	"version_workflow_review_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_body" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "facts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"value" varchar,
  	"source" varchar,
  	"evidence" varchar,
  	"verified_by_id" integer,
  	"verified_at" timestamp(3) with time zone,
  	"status" "enum_facts_status" DEFAULT 'unverified' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "facts_locales" (
  	"display_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ref" varchar NOT NULL,
  	"type" "enum_enquiries_type",
  	"project_type" varchar,
  	"sector" varchar,
  	"location" varchar,
  	"property_type" varchar,
  	"approx_area" varchar,
  	"stage" varchar,
  	"target_start" varchar,
  	"budget_band" varchar,
  	"brief" varchar,
  	"plans_link" varchar,
  	"name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"preferred_method" varchar,
  	"preferred_time" varchar,
  	"consent_given" boolean,
  	"consent_text_version" varchar,
  	"consent_at" timestamp(3) with time zone,
  	"source_page" varchar,
  	"utm" jsonb,
  	"assigned_to_id" integer,
  	"delivery_status_email" varchar,
  	"delivery_status_crm" varchar,
  	"delivery_status_attempts" numeric DEFAULT 0,
  	"delivery_status_last_error" varchar,
  	"retention_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiries_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar,
  	"type" "enum_redirects_type" DEFAULT '301' NOT NULL,
  	"notes" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"actor_id" integer,
  	"action" varchar NOT NULL,
  	"collection" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"from_status" varchar,
  	"to_status" varchar,
  	"diff_summary" varchar,
  	"ip" varchar,
  	"at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link" varchar NOT NULL,
  	"section" varchar
  );
  
  CREATE TABLE "navigation_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link" varchar
  );
  
  CREATE TABLE "footer_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"copy" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"address_fact_key" varchar,
  	"phone_fact_key" varchar,
  	"whatsapp_fact_key" varchar,
  	"email_fact_key" varchar,
  	"geo_latitude" numeric,
  	"geo_longitude" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_info_locales" (
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "social_profiles_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "social_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults_locales" (
  	"title_template" varchar DEFAULT '%s · Introyale Interiors',
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "consultation_settings_budget_bands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min" numeric,
  	"max" numeric
  );
  
  CREATE TABLE "consultation_settings_budget_bands_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "consultation_settings_routing_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sector_id" integer,
  	"assignee_id" integer
  );
  
  CREATE TABLE "consultation_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "consultation_settings_locales" (
  	"sla_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "legal_entity" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legal_name" varchar,
  	"licence_number_fact_key" varchar,
  	"issuing_authority" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "integrations_secret_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "integrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature_flags_crm" boolean DEFAULT false,
  	"feature_flags_cloudflare" boolean DEFAULT false,
  	"feature_flags_umami" boolean DEFAULT true,
  	"feature_flags_booking" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'content_editor' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "totp_enabled" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "totp_secret" varchar;
  ALTER TABLE "users" ADD COLUMN "totp_failed_attempts" numeric DEFAULT 0;
  ALTER TABLE "users" ADD COLUMN "totp_locked_until" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sectors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "property_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_members_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "awards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "journal_posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "journal_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "facts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_log_id" integer;
  ALTER TABLE "users_totp_recovery_codes" ADD CONSTRAINT "users_totp_recovery_codes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_usage_approved_by_id_users_id_fk" FOREIGN KEY ("usage_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_before_after" ADD CONSTRAINT "projects_before_after_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_before_after" ADD CONSTRAINT "projects_before_after_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_before_after" ADD CONSTRAINT "projects_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_before_after_locales" ADD CONSTRAINT "projects_before_after_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_plans_hotspots" ADD CONSTRAINT "projects_plans_hotspots_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_plans_hotspots" ADD CONSTRAINT "projects_plans_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_plans_hotspots_locales" ADD CONSTRAINT "projects_plans_hotspots_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_plans_hotspots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_plans" ADD CONSTRAINT "projects_plans_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_plans" ADD CONSTRAINT "projects_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_id_media_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_workflow_published_by_id_users_id_fk" FOREIGN KEY ("workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_before_after" ADD CONSTRAINT "_projects_v_version_before_after_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_before_after" ADD CONSTRAINT "_projects_v_version_before_after_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_before_after" ADD CONSTRAINT "_projects_v_version_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_before_after_locales" ADD CONSTRAINT "_projects_v_version_before_after_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_before_after"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_plans_hotspots" ADD CONSTRAINT "_projects_v_version_plans_hotspots_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_plans_hotspots" ADD CONSTRAINT "_projects_v_version_plans_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_plans_hotspots_locales" ADD CONSTRAINT "_projects_v_version_plans_hotspots_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_plans_hotspots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_plans" ADD CONSTRAINT "_projects_v_version_plans_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_plans" ADD CONSTRAINT "_projects_v_version_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_sector_id_sectors_id_fk" FOREIGN KEY ("version_sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_property_type_id_property_types_id_fk" FOREIGN KEY ("version_property_type_id") REFERENCES "public"."property_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_hero_id_media_id_fk" FOREIGN KEY ("version_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_testimonial_id_testimonials_id_fk" FOREIGN KEY ("version_testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("version_workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("version_workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_workflow_published_by_id_users_id_fk" FOREIGN KEY ("version_workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_scope" ADD CONSTRAINT "services_scope_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_deliverables" ADD CONSTRAINT "services_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_process_steps" ADD CONSTRAINT "services_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_workflow_published_by_id_users_id_fk" FOREIGN KEY ("workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_scope" ADD CONSTRAINT "_services_v_version_scope_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_deliverables" ADD CONSTRAINT "_services_v_version_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_process_steps" ADD CONSTRAINT "_services_v_version_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("version_workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("version_workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_workflow_published_by_id_users_id_fk" FOREIGN KEY ("version_workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_hero_id_media_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_workflow_published_by_id_users_id_fk" FOREIGN KEY ("workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors_locales" ADD CONSTRAINT "sectors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectors_rels" ADD CONSTRAINT "sectors_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_parent_id_sectors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_version_hero_id_media_id_fk" FOREIGN KEY ("version_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_version_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("version_workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_version_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_version_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("version_workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_version_workflow_published_by_id_users_id_fk" FOREIGN KEY ("version_workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v_locales" ADD CONSTRAINT "_sectors_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_rels" ADD CONSTRAINT "_sectors_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_sectors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_rels" ADD CONSTRAINT "_sectors_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sectors_v_rels" ADD CONSTRAINT "_sectors_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "property_types" ADD CONSTRAINT "property_types_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "property_types_locales" ADD CONSTRAINT "property_types_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."property_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members_credentials" ADD CONSTRAINT "team_members_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_workflow_published_by_id_users_id_fk" FOREIGN KEY ("workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_locales" ADD CONSTRAINT "team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v_version_credentials" ADD CONSTRAINT "_team_members_v_version_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("version_workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("version_workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_workflow_published_by_id_users_id_fk" FOREIGN KEY ("version_workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_locales" ADD CONSTRAINT "_team_members_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_workflow_published_by_id_users_id_fk" FOREIGN KEY ("workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_project_id_projects_id_fk" FOREIGN KEY ("version_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("version_workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("version_workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_workflow_published_by_id_users_id_fk" FOREIGN KEY ("version_workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_evidence_file_id_media_id_fk" FOREIGN KEY ("evidence_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts_citations" ADD CONSTRAINT "journal_posts_citations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_author_id_team_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_workflow_published_by_id_users_id_fk" FOREIGN KEY ("workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts_locales" ADD CONSTRAINT "journal_posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_posts_rels" ADD CONSTRAINT "journal_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."journal_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_posts_rels" ADD CONSTRAINT "journal_posts_rels_journal_categories_fk" FOREIGN KEY ("journal_categories_id") REFERENCES "public"."journal_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_posts_rels" ADD CONSTRAINT "journal_posts_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_posts_rels" ADD CONSTRAINT "journal_posts_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_journal_posts_v_version_citations" ADD CONSTRAINT "_journal_posts_v_version_citations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_journal_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_parent_id_journal_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."journal_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_author_id_team_members_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("version_workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("version_workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_workflow_published_by_id_users_id_fk" FOREIGN KEY ("version_workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v_locales" ADD CONSTRAINT "_journal_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_journal_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_journal_posts_v_rels" ADD CONSTRAINT "_journal_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_journal_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_journal_posts_v_rels" ADD CONSTRAINT "_journal_posts_v_rels_journal_categories_fk" FOREIGN KEY ("journal_categories_id") REFERENCES "public"."journal_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_journal_posts_v_rels" ADD CONSTRAINT "_journal_posts_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_journal_posts_v_rels" ADD CONSTRAINT "_journal_posts_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_categories_locales" ADD CONSTRAINT "journal_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_workflow_published_by_id_users_id_fk" FOREIGN KEY ("workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_workflow_submitted_by_id_users_id_fk" FOREIGN KEY ("version_workflow_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_workflow_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_workflow_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_workflow_approved_by_id_users_id_fk" FOREIGN KEY ("version_workflow_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_workflow_published_by_id_users_id_fk" FOREIGN KEY ("version_workflow_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facts" ADD CONSTRAINT "facts_verified_by_id_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "facts_locales" ADD CONSTRAINT "facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries_texts" ADD CONSTRAINT "enquiries_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_locales" ADD CONSTRAINT "navigation_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_links_locales" ADD CONSTRAINT "footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_info_locales" ADD CONSTRAINT "contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_profiles_items" ADD CONSTRAINT "social_profiles_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_defaults_locales" ADD CONSTRAINT "seo_defaults_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consultation_settings_budget_bands" ADD CONSTRAINT "consultation_settings_budget_bands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consultation_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consultation_settings_budget_bands_locales" ADD CONSTRAINT "consultation_settings_budget_bands_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consultation_settings_budget_bands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consultation_settings_routing_rules" ADD CONSTRAINT "consultation_settings_routing_rules_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_settings_routing_rules" ADD CONSTRAINT "consultation_settings_routing_rules_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_settings_routing_rules" ADD CONSTRAINT "consultation_settings_routing_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consultation_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consultation_settings_locales" ADD CONSTRAINT "consultation_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consultation_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "integrations_secret_names" ADD CONSTRAINT "integrations_secret_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_totp_recovery_codes_order_idx" ON "users_totp_recovery_codes" USING btree ("_order");
  CREATE INDEX "users_totp_recovery_codes_parent_id_idx" ON "users_totp_recovery_codes" USING btree ("_parent_id");
  CREATE INDEX "media_usage_approved_by_idx" ON "media" USING btree ("usage_approved_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_w480_sizes_w480_filename_idx" ON "media" USING btree ("sizes_w480_filename");
  CREATE INDEX "media_sizes_w768_sizes_w768_filename_idx" ON "media" USING btree ("sizes_w768_filename");
  CREATE INDEX "media_sizes_w1080_sizes_w1080_filename_idx" ON "media" USING btree ("sizes_w1080_filename");
  CREATE INDEX "media_sizes_w1440_sizes_w1440_filename_idx" ON "media" USING btree ("sizes_w1440_filename");
  CREATE INDEX "media_sizes_w1920_sizes_w1920_filename_idx" ON "media" USING btree ("sizes_w1920_filename");
  CREATE INDEX "media_sizes_w2560_sizes_w2560_filename_idx" ON "media" USING btree ("sizes_w2560_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_before_after_order_idx" ON "projects_before_after" USING btree ("_order");
  CREATE INDEX "projects_before_after_parent_id_idx" ON "projects_before_after" USING btree ("_parent_id");
  CREATE INDEX "projects_before_after_before_idx" ON "projects_before_after" USING btree ("before_id");
  CREATE INDEX "projects_before_after_after_idx" ON "projects_before_after" USING btree ("after_id");
  CREATE UNIQUE INDEX "projects_before_after_locales_locale_parent_id_unique" ON "projects_before_after_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_before_after_locales_parent_id_idx" ON "projects_before_after_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_plans_hotspots_order_idx" ON "projects_plans_hotspots" USING btree ("_order");
  CREATE INDEX "projects_plans_hotspots_parent_id_idx" ON "projects_plans_hotspots" USING btree ("_parent_id");
  CREATE INDEX "projects_plans_hotspots_media_idx" ON "projects_plans_hotspots" USING btree ("media_id");
  CREATE UNIQUE INDEX "projects_plans_hotspots_locales_locale_parent_id_unique" ON "projects_plans_hotspots_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_plans_hotspots_locales_parent_id_idx" ON "projects_plans_hotspots_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_plans_order_idx" ON "projects_plans" USING btree ("_order");
  CREATE INDEX "projects_plans_parent_id_idx" ON "projects_plans" USING btree ("_parent_id");
  CREATE INDEX "projects_plans_image_idx" ON "projects_plans" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_sector_idx" ON "projects" USING btree ("sector_id");
  CREATE INDEX "projects_property_type_idx" ON "projects" USING btree ("property_type_id");
  CREATE INDEX "projects_hero_idx" ON "projects" USING btree ("hero_id");
  CREATE INDEX "projects_testimonial_idx" ON "projects" USING btree ("testimonial_id");
  CREATE INDEX "projects_seo_seo_og_image_idx" ON "projects" USING btree ("seo_og_image_id");
  CREATE INDEX "projects_workflow_workflow_status_idx" ON "projects" USING btree ("workflow_status");
  CREATE INDEX "projects_workflow_workflow_submitted_by_idx" ON "projects" USING btree ("workflow_submitted_by_id");
  CREATE INDEX "projects_workflow_workflow_reviewed_by_idx" ON "projects" USING btree ("workflow_reviewed_by_id");
  CREATE INDEX "projects_workflow_workflow_approved_by_idx" ON "projects" USING btree ("workflow_approved_by_id");
  CREATE INDEX "projects_workflow_workflow_published_by_idx" ON "projects" USING btree ("workflow_published_by_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_services_id_idx" ON "projects_rels" USING btree ("services_id");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "projects_rels_team_members_id_idx" ON "projects_rels" USING btree ("team_members_id");
  CREATE INDEX "projects_rels_projects_id_idx" ON "projects_rels" USING btree ("projects_id");
  CREATE INDEX "_projects_v_version_before_after_order_idx" ON "_projects_v_version_before_after" USING btree ("_order");
  CREATE INDEX "_projects_v_version_before_after_parent_id_idx" ON "_projects_v_version_before_after" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_before_after_before_idx" ON "_projects_v_version_before_after" USING btree ("before_id");
  CREATE INDEX "_projects_v_version_before_after_after_idx" ON "_projects_v_version_before_after" USING btree ("after_id");
  CREATE UNIQUE INDEX "_projects_v_version_before_after_locales_locale_parent_id_un" ON "_projects_v_version_before_after_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_before_after_locales_parent_id_idx" ON "_projects_v_version_before_after_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_plans_hotspots_order_idx" ON "_projects_v_version_plans_hotspots" USING btree ("_order");
  CREATE INDEX "_projects_v_version_plans_hotspots_parent_id_idx" ON "_projects_v_version_plans_hotspots" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_plans_hotspots_media_idx" ON "_projects_v_version_plans_hotspots" USING btree ("media_id");
  CREATE UNIQUE INDEX "_projects_v_version_plans_hotspots_locales_locale_parent_id_" ON "_projects_v_version_plans_hotspots_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_plans_hotspots_locales_parent_id_idx" ON "_projects_v_version_plans_hotspots_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_plans_order_idx" ON "_projects_v_version_plans" USING btree ("_order");
  CREATE INDEX "_projects_v_version_plans_parent_id_idx" ON "_projects_v_version_plans" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_plans_image_idx" ON "_projects_v_version_plans" USING btree ("image_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_sector_idx" ON "_projects_v" USING btree ("version_sector_id");
  CREATE INDEX "_projects_v_version_version_property_type_idx" ON "_projects_v" USING btree ("version_property_type_id");
  CREATE INDEX "_projects_v_version_version_hero_idx" ON "_projects_v" USING btree ("version_hero_id");
  CREATE INDEX "_projects_v_version_version_testimonial_idx" ON "_projects_v" USING btree ("version_testimonial_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_og_image_idx" ON "_projects_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_projects_v_version_workflow_version_workflow_status_idx" ON "_projects_v" USING btree ("version_workflow_status");
  CREATE INDEX "_projects_v_version_workflow_version_workflow_submitted__idx" ON "_projects_v" USING btree ("version_workflow_submitted_by_id");
  CREATE INDEX "_projects_v_version_workflow_version_workflow_reviewed_b_idx" ON "_projects_v" USING btree ("version_workflow_reviewed_by_id");
  CREATE INDEX "_projects_v_version_workflow_version_workflow_approved_b_idx" ON "_projects_v" USING btree ("version_workflow_approved_by_id");
  CREATE INDEX "_projects_v_version_workflow_version_workflow_published__idx" ON "_projects_v" USING btree ("version_workflow_published_by_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_locales_parent_id_idx" ON "_projects_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_services_id_idx" ON "_projects_v_rels" USING btree ("services_id");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_rels_team_members_id_idx" ON "_projects_v_rels" USING btree ("team_members_id");
  CREATE INDEX "_projects_v_rels_projects_id_idx" ON "_projects_v_rels" USING btree ("projects_id");
  CREATE INDEX "services_scope_order_idx" ON "services_scope" USING btree ("_order");
  CREATE INDEX "services_scope_parent_id_idx" ON "services_scope" USING btree ("_parent_id");
  CREATE INDEX "services_deliverables_order_idx" ON "services_deliverables" USING btree ("_order");
  CREATE INDEX "services_deliverables_parent_id_idx" ON "services_deliverables" USING btree ("_parent_id");
  CREATE INDEX "services_process_steps_order_idx" ON "services_process_steps" USING btree ("_order");
  CREATE INDEX "services_process_steps_parent_id_idx" ON "services_process_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_seo_seo_og_image_idx" ON "services" USING btree ("seo_og_image_id");
  CREATE INDEX "services_workflow_workflow_status_idx" ON "services" USING btree ("workflow_status");
  CREATE INDEX "services_workflow_workflow_submitted_by_idx" ON "services" USING btree ("workflow_submitted_by_id");
  CREATE INDEX "services_workflow_workflow_reviewed_by_idx" ON "services" USING btree ("workflow_reviewed_by_id");
  CREATE INDEX "services_workflow_workflow_approved_by_idx" ON "services" USING btree ("workflow_approved_by_id");
  CREATE INDEX "services_workflow_workflow_published_by_idx" ON "services" USING btree ("workflow_published_by_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_faqs_id_idx" ON "services_rels" USING btree ("faqs_id");
  CREATE INDEX "services_rels_projects_id_idx" ON "services_rels" USING btree ("projects_id");
  CREATE INDEX "_services_v_version_scope_order_idx" ON "_services_v_version_scope" USING btree ("_order");
  CREATE INDEX "_services_v_version_scope_parent_id_idx" ON "_services_v_version_scope" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_deliverables_order_idx" ON "_services_v_version_deliverables" USING btree ("_order");
  CREATE INDEX "_services_v_version_deliverables_parent_id_idx" ON "_services_v_version_deliverables" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_process_steps_order_idx" ON "_services_v_version_process_steps" USING btree ("_order");
  CREATE INDEX "_services_v_version_process_steps_parent_id_idx" ON "_services_v_version_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_seo_version_seo_og_image_idx" ON "_services_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_services_v_version_workflow_version_workflow_status_idx" ON "_services_v" USING btree ("version_workflow_status");
  CREATE INDEX "_services_v_version_workflow_version_workflow_submitted__idx" ON "_services_v" USING btree ("version_workflow_submitted_by_id");
  CREATE INDEX "_services_v_version_workflow_version_workflow_reviewed_b_idx" ON "_services_v" USING btree ("version_workflow_reviewed_by_id");
  CREATE INDEX "_services_v_version_workflow_version_workflow_approved_b_idx" ON "_services_v" USING btree ("version_workflow_approved_by_id");
  CREATE INDEX "_services_v_version_workflow_version_workflow_published__idx" ON "_services_v" USING btree ("version_workflow_published_by_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_autosave_idx" ON "_services_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_locales_parent_id_idx" ON "_services_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_faqs_id_idx" ON "_services_v_rels" USING btree ("faqs_id");
  CREATE INDEX "_services_v_rels_projects_id_idx" ON "_services_v_rels" USING btree ("projects_id");
  CREATE UNIQUE INDEX "sectors_slug_idx" ON "sectors" USING btree ("slug");
  CREATE INDEX "sectors_hero_idx" ON "sectors" USING btree ("hero_id");
  CREATE INDEX "sectors_seo_seo_og_image_idx" ON "sectors" USING btree ("seo_og_image_id");
  CREATE INDEX "sectors_workflow_workflow_status_idx" ON "sectors" USING btree ("workflow_status");
  CREATE INDEX "sectors_workflow_workflow_submitted_by_idx" ON "sectors" USING btree ("workflow_submitted_by_id");
  CREATE INDEX "sectors_workflow_workflow_reviewed_by_idx" ON "sectors" USING btree ("workflow_reviewed_by_id");
  CREATE INDEX "sectors_workflow_workflow_approved_by_idx" ON "sectors" USING btree ("workflow_approved_by_id");
  CREATE INDEX "sectors_workflow_workflow_published_by_idx" ON "sectors" USING btree ("workflow_published_by_id");
  CREATE INDEX "sectors_updated_at_idx" ON "sectors" USING btree ("updated_at");
  CREATE INDEX "sectors_created_at_idx" ON "sectors" USING btree ("created_at");
  CREATE INDEX "sectors__status_idx" ON "sectors" USING btree ("_status");
  CREATE UNIQUE INDEX "sectors_locales_locale_parent_id_unique" ON "sectors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sectors_locales_parent_id_idx" ON "sectors_locales" USING btree ("_parent_id");
  CREATE INDEX "sectors_rels_order_idx" ON "sectors_rels" USING btree ("order");
  CREATE INDEX "sectors_rels_parent_idx" ON "sectors_rels" USING btree ("parent_id");
  CREATE INDEX "sectors_rels_path_idx" ON "sectors_rels" USING btree ("path");
  CREATE INDEX "sectors_rels_projects_id_idx" ON "sectors_rels" USING btree ("projects_id");
  CREATE INDEX "sectors_rels_faqs_id_idx" ON "sectors_rels" USING btree ("faqs_id");
  CREATE INDEX "_sectors_v_parent_idx" ON "_sectors_v" USING btree ("parent_id");
  CREATE INDEX "_sectors_v_version_version_slug_idx" ON "_sectors_v" USING btree ("version_slug");
  CREATE INDEX "_sectors_v_version_version_hero_idx" ON "_sectors_v" USING btree ("version_hero_id");
  CREATE INDEX "_sectors_v_version_seo_version_seo_og_image_idx" ON "_sectors_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_sectors_v_version_workflow_version_workflow_status_idx" ON "_sectors_v" USING btree ("version_workflow_status");
  CREATE INDEX "_sectors_v_version_workflow_version_workflow_submitted_b_idx" ON "_sectors_v" USING btree ("version_workflow_submitted_by_id");
  CREATE INDEX "_sectors_v_version_workflow_version_workflow_reviewed_by_idx" ON "_sectors_v" USING btree ("version_workflow_reviewed_by_id");
  CREATE INDEX "_sectors_v_version_workflow_version_workflow_approved_by_idx" ON "_sectors_v" USING btree ("version_workflow_approved_by_id");
  CREATE INDEX "_sectors_v_version_workflow_version_workflow_published_b_idx" ON "_sectors_v" USING btree ("version_workflow_published_by_id");
  CREATE INDEX "_sectors_v_version_version_updated_at_idx" ON "_sectors_v" USING btree ("version_updated_at");
  CREATE INDEX "_sectors_v_version_version_created_at_idx" ON "_sectors_v" USING btree ("version_created_at");
  CREATE INDEX "_sectors_v_version_version__status_idx" ON "_sectors_v" USING btree ("version__status");
  CREATE INDEX "_sectors_v_created_at_idx" ON "_sectors_v" USING btree ("created_at");
  CREATE INDEX "_sectors_v_updated_at_idx" ON "_sectors_v" USING btree ("updated_at");
  CREATE INDEX "_sectors_v_snapshot_idx" ON "_sectors_v" USING btree ("snapshot");
  CREATE INDEX "_sectors_v_published_locale_idx" ON "_sectors_v" USING btree ("published_locale");
  CREATE INDEX "_sectors_v_latest_idx" ON "_sectors_v" USING btree ("latest");
  CREATE INDEX "_sectors_v_autosave_idx" ON "_sectors_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_sectors_v_locales_locale_parent_id_unique" ON "_sectors_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_sectors_v_locales_parent_id_idx" ON "_sectors_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_sectors_v_rels_order_idx" ON "_sectors_v_rels" USING btree ("order");
  CREATE INDEX "_sectors_v_rels_parent_idx" ON "_sectors_v_rels" USING btree ("parent_id");
  CREATE INDEX "_sectors_v_rels_path_idx" ON "_sectors_v_rels" USING btree ("path");
  CREATE INDEX "_sectors_v_rels_projects_id_idx" ON "_sectors_v_rels" USING btree ("projects_id");
  CREATE INDEX "_sectors_v_rels_faqs_id_idx" ON "_sectors_v_rels" USING btree ("faqs_id");
  CREATE UNIQUE INDEX "property_types_slug_idx" ON "property_types" USING btree ("slug");
  CREATE INDEX "property_types_sector_idx" ON "property_types" USING btree ("sector_id");
  CREATE INDEX "property_types_updated_at_idx" ON "property_types" USING btree ("updated_at");
  CREATE INDEX "property_types_created_at_idx" ON "property_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "property_types_locales_locale_parent_id_unique" ON "property_types_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "property_types_locales_parent_id_idx" ON "property_types_locales" USING btree ("_parent_id");
  CREATE INDEX "team_members_credentials_order_idx" ON "team_members_credentials" USING btree ("_order");
  CREATE INDEX "team_members_credentials_parent_id_idx" ON "team_members_credentials" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "team_members_slug_idx" ON "team_members" USING btree ("slug");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_seo_seo_og_image_idx" ON "team_members" USING btree ("seo_og_image_id");
  CREATE INDEX "team_members_workflow_workflow_status_idx" ON "team_members" USING btree ("workflow_status");
  CREATE INDEX "team_members_workflow_workflow_submitted_by_idx" ON "team_members" USING btree ("workflow_submitted_by_id");
  CREATE INDEX "team_members_workflow_workflow_reviewed_by_idx" ON "team_members" USING btree ("workflow_reviewed_by_id");
  CREATE INDEX "team_members_workflow_workflow_approved_by_idx" ON "team_members" USING btree ("workflow_approved_by_id");
  CREATE INDEX "team_members_workflow_workflow_published_by_idx" ON "team_members" USING btree ("workflow_published_by_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE UNIQUE INDEX "team_members_locales_locale_parent_id_unique" ON "team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_members_locales_parent_id_idx" ON "team_members_locales" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_version_credentials_order_idx" ON "_team_members_v_version_credentials" USING btree ("_order");
  CREATE INDEX "_team_members_v_version_credentials_parent_id_idx" ON "_team_members_v_version_credentials" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_slug_idx" ON "_team_members_v" USING btree ("version_slug");
  CREATE INDEX "_team_members_v_version_version_photo_idx" ON "_team_members_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_members_v_version_seo_version_seo_og_image_idx" ON "_team_members_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_team_members_v_version_workflow_version_workflow_status_idx" ON "_team_members_v" USING btree ("version_workflow_status");
  CREATE INDEX "_team_members_v_version_workflow_version_workflow_submit_idx" ON "_team_members_v" USING btree ("version_workflow_submitted_by_id");
  CREATE INDEX "_team_members_v_version_workflow_version_workflow_review_idx" ON "_team_members_v" USING btree ("version_workflow_reviewed_by_id");
  CREATE INDEX "_team_members_v_version_workflow_version_workflow_approv_idx" ON "_team_members_v" USING btree ("version_workflow_approved_by_id");
  CREATE INDEX "_team_members_v_version_workflow_version_workflow_publis_idx" ON "_team_members_v" USING btree ("version_workflow_published_by_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_snapshot_idx" ON "_team_members_v" USING btree ("snapshot");
  CREATE INDEX "_team_members_v_published_locale_idx" ON "_team_members_v" USING btree ("published_locale");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE INDEX "_team_members_v_autosave_idx" ON "_team_members_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_team_members_v_locales_locale_parent_id_unique" ON "_team_members_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_team_members_v_locales_parent_id_idx" ON "_team_members_v_locales" USING btree ("_parent_id");
  CREATE INDEX "testimonials_project_idx" ON "testimonials" USING btree ("project_id");
  CREATE INDEX "testimonials_workflow_workflow_status_idx" ON "testimonials" USING btree ("workflow_status");
  CREATE INDEX "testimonials_workflow_workflow_submitted_by_idx" ON "testimonials" USING btree ("workflow_submitted_by_id");
  CREATE INDEX "testimonials_workflow_workflow_reviewed_by_idx" ON "testimonials" USING btree ("workflow_reviewed_by_id");
  CREATE INDEX "testimonials_workflow_workflow_approved_by_idx" ON "testimonials" USING btree ("workflow_approved_by_id");
  CREATE INDEX "testimonials_workflow_workflow_published_by_idx" ON "testimonials" USING btree ("workflow_published_by_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_locales_parent_id_idx" ON "testimonials_locales" USING btree ("_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_project_idx" ON "_testimonials_v" USING btree ("version_project_id");
  CREATE INDEX "_testimonials_v_version_workflow_version_workflow_status_idx" ON "_testimonials_v" USING btree ("version_workflow_status");
  CREATE INDEX "_testimonials_v_version_workflow_version_workflow_submit_idx" ON "_testimonials_v" USING btree ("version_workflow_submitted_by_id");
  CREATE INDEX "_testimonials_v_version_workflow_version_workflow_review_idx" ON "_testimonials_v" USING btree ("version_workflow_reviewed_by_id");
  CREATE INDEX "_testimonials_v_version_workflow_version_workflow_approv_idx" ON "_testimonials_v" USING btree ("version_workflow_approved_by_id");
  CREATE INDEX "_testimonials_v_version_workflow_version_workflow_publis_idx" ON "_testimonials_v" USING btree ("version_workflow_published_by_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE INDEX "_testimonials_v_autosave_idx" ON "_testimonials_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_locales_parent_id_idx" ON "_testimonials_v_locales" USING btree ("_parent_id");
  CREATE INDEX "clients_logo_idx" ON "clients" USING btree ("logo_id");
  CREATE INDEX "clients_sector_idx" ON "clients" USING btree ("sector_id");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE INDEX "awards_evidence_file_idx" ON "awards" USING btree ("evidence_file_id");
  CREATE INDEX "awards_project_idx" ON "awards" USING btree ("project_id");
  CREATE INDEX "awards_updated_at_idx" ON "awards" USING btree ("updated_at");
  CREATE INDEX "awards_created_at_idx" ON "awards" USING btree ("created_at");
  CREATE INDEX "journal_posts_citations_order_idx" ON "journal_posts_citations" USING btree ("_order");
  CREATE INDEX "journal_posts_citations_parent_id_idx" ON "journal_posts_citations" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "journal_posts_slug_idx" ON "journal_posts" USING btree ("slug");
  CREATE INDEX "journal_posts_author_idx" ON "journal_posts" USING btree ("author_id");
  CREATE INDEX "journal_posts_hero_image_idx" ON "journal_posts" USING btree ("hero_image_id");
  CREATE INDEX "journal_posts_seo_seo_og_image_idx" ON "journal_posts" USING btree ("seo_og_image_id");
  CREATE INDEX "journal_posts_workflow_workflow_status_idx" ON "journal_posts" USING btree ("workflow_status");
  CREATE INDEX "journal_posts_workflow_workflow_submitted_by_idx" ON "journal_posts" USING btree ("workflow_submitted_by_id");
  CREATE INDEX "journal_posts_workflow_workflow_reviewed_by_idx" ON "journal_posts" USING btree ("workflow_reviewed_by_id");
  CREATE INDEX "journal_posts_workflow_workflow_approved_by_idx" ON "journal_posts" USING btree ("workflow_approved_by_id");
  CREATE INDEX "journal_posts_workflow_workflow_published_by_idx" ON "journal_posts" USING btree ("workflow_published_by_id");
  CREATE INDEX "journal_posts_updated_at_idx" ON "journal_posts" USING btree ("updated_at");
  CREATE INDEX "journal_posts_created_at_idx" ON "journal_posts" USING btree ("created_at");
  CREATE INDEX "journal_posts__status_idx" ON "journal_posts" USING btree ("_status");
  CREATE UNIQUE INDEX "journal_posts_locales_locale_parent_id_unique" ON "journal_posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "journal_posts_locales_parent_id_idx" ON "journal_posts_locales" USING btree ("_parent_id");
  CREATE INDEX "journal_posts_rels_order_idx" ON "journal_posts_rels" USING btree ("order");
  CREATE INDEX "journal_posts_rels_parent_idx" ON "journal_posts_rels" USING btree ("parent_id");
  CREATE INDEX "journal_posts_rels_path_idx" ON "journal_posts_rels" USING btree ("path");
  CREATE INDEX "journal_posts_rels_journal_categories_id_idx" ON "journal_posts_rels" USING btree ("journal_categories_id");
  CREATE INDEX "journal_posts_rels_projects_id_idx" ON "journal_posts_rels" USING btree ("projects_id");
  CREATE INDEX "journal_posts_rels_services_id_idx" ON "journal_posts_rels" USING btree ("services_id");
  CREATE INDEX "_journal_posts_v_version_citations_order_idx" ON "_journal_posts_v_version_citations" USING btree ("_order");
  CREATE INDEX "_journal_posts_v_version_citations_parent_id_idx" ON "_journal_posts_v_version_citations" USING btree ("_parent_id");
  CREATE INDEX "_journal_posts_v_parent_idx" ON "_journal_posts_v" USING btree ("parent_id");
  CREATE INDEX "_journal_posts_v_version_version_slug_idx" ON "_journal_posts_v" USING btree ("version_slug");
  CREATE INDEX "_journal_posts_v_version_version_author_idx" ON "_journal_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_journal_posts_v_version_version_hero_image_idx" ON "_journal_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_journal_posts_v_version_seo_version_seo_og_image_idx" ON "_journal_posts_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_journal_posts_v_version_workflow_version_workflow_statu_idx" ON "_journal_posts_v" USING btree ("version_workflow_status");
  CREATE INDEX "_journal_posts_v_version_workflow_version_workflow_submi_idx" ON "_journal_posts_v" USING btree ("version_workflow_submitted_by_id");
  CREATE INDEX "_journal_posts_v_version_workflow_version_workflow_revie_idx" ON "_journal_posts_v" USING btree ("version_workflow_reviewed_by_id");
  CREATE INDEX "_journal_posts_v_version_workflow_version_workflow_appro_idx" ON "_journal_posts_v" USING btree ("version_workflow_approved_by_id");
  CREATE INDEX "_journal_posts_v_version_workflow_version_workflow_publi_idx" ON "_journal_posts_v" USING btree ("version_workflow_published_by_id");
  CREATE INDEX "_journal_posts_v_version_version_updated_at_idx" ON "_journal_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_journal_posts_v_version_version_created_at_idx" ON "_journal_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_journal_posts_v_version_version__status_idx" ON "_journal_posts_v" USING btree ("version__status");
  CREATE INDEX "_journal_posts_v_created_at_idx" ON "_journal_posts_v" USING btree ("created_at");
  CREATE INDEX "_journal_posts_v_updated_at_idx" ON "_journal_posts_v" USING btree ("updated_at");
  CREATE INDEX "_journal_posts_v_snapshot_idx" ON "_journal_posts_v" USING btree ("snapshot");
  CREATE INDEX "_journal_posts_v_published_locale_idx" ON "_journal_posts_v" USING btree ("published_locale");
  CREATE INDEX "_journal_posts_v_latest_idx" ON "_journal_posts_v" USING btree ("latest");
  CREATE INDEX "_journal_posts_v_autosave_idx" ON "_journal_posts_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_journal_posts_v_locales_locale_parent_id_unique" ON "_journal_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_journal_posts_v_locales_parent_id_idx" ON "_journal_posts_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_journal_posts_v_rels_order_idx" ON "_journal_posts_v_rels" USING btree ("order");
  CREATE INDEX "_journal_posts_v_rels_parent_idx" ON "_journal_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_journal_posts_v_rels_path_idx" ON "_journal_posts_v_rels" USING btree ("path");
  CREATE INDEX "_journal_posts_v_rels_journal_categories_id_idx" ON "_journal_posts_v_rels" USING btree ("journal_categories_id");
  CREATE INDEX "_journal_posts_v_rels_projects_id_idx" ON "_journal_posts_v_rels" USING btree ("projects_id");
  CREATE INDEX "_journal_posts_v_rels_services_id_idx" ON "_journal_posts_v_rels" USING btree ("services_id");
  CREATE UNIQUE INDEX "journal_categories_slug_idx" ON "journal_categories" USING btree ("slug");
  CREATE INDEX "journal_categories_updated_at_idx" ON "journal_categories" USING btree ("updated_at");
  CREATE INDEX "journal_categories_created_at_idx" ON "journal_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "journal_categories_locales_locale_parent_id_unique" ON "journal_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "journal_categories_locales_parent_id_idx" ON "journal_categories_locales" USING btree ("_parent_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_locales_parent_id_idx" ON "faqs_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_workflow_workflow_status_idx" ON "pages" USING btree ("workflow_status");
  CREATE INDEX "pages_workflow_workflow_submitted_by_idx" ON "pages" USING btree ("workflow_submitted_by_id");
  CREATE INDEX "pages_workflow_workflow_reviewed_by_idx" ON "pages" USING btree ("workflow_reviewed_by_id");
  CREATE INDEX "pages_workflow_workflow_approved_by_idx" ON "pages" USING btree ("workflow_approved_by_id");
  CREATE INDEX "pages_workflow_workflow_published_by_idx" ON "pages" USING btree ("workflow_published_by_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_workflow_version_workflow_status_idx" ON "_pages_v" USING btree ("version_workflow_status");
  CREATE INDEX "_pages_v_version_workflow_version_workflow_submitted_by_idx" ON "_pages_v" USING btree ("version_workflow_submitted_by_id");
  CREATE INDEX "_pages_v_version_workflow_version_workflow_reviewed_by_idx" ON "_pages_v" USING btree ("version_workflow_reviewed_by_id");
  CREATE INDEX "_pages_v_version_workflow_version_workflow_approved_by_idx" ON "_pages_v" USING btree ("version_workflow_approved_by_id");
  CREATE INDEX "_pages_v_version_workflow_version_workflow_published_by_idx" ON "_pages_v" USING btree ("version_workflow_published_by_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "facts_key_idx" ON "facts" USING btree ("key");
  CREATE INDEX "facts_verified_by_idx" ON "facts" USING btree ("verified_by_id");
  CREATE INDEX "facts_updated_at_idx" ON "facts" USING btree ("updated_at");
  CREATE INDEX "facts_created_at_idx" ON "facts" USING btree ("created_at");
  CREATE UNIQUE INDEX "facts_locales_locale_parent_id_unique" ON "facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "facts_locales_parent_id_idx" ON "facts_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "enquiries_ref_idx" ON "enquiries" USING btree ("ref");
  CREATE INDEX "enquiries_assigned_to_idx" ON "enquiries" USING btree ("assigned_to_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "enquiries_texts_order_parent" ON "enquiries_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_id");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_items_locales_locale_parent_id_unique" ON "navigation_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_items_locales_parent_id_idx" ON "navigation_items_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_links_order_idx" ON "footer_links" USING btree ("_order");
  CREATE INDEX "footer_links_parent_id_idx" ON "footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_links_locales_locale_parent_id_unique" ON "footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_links_locales_parent_id_idx" ON "footer_links_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_locales_parent_id_idx" ON "footer_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_info_locales_locale_parent_id_unique" ON "contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_info_locales_parent_id_idx" ON "contact_info_locales" USING btree ("_parent_id");
  CREATE INDEX "social_profiles_items_order_idx" ON "social_profiles_items" USING btree ("_order");
  CREATE INDEX "social_profiles_items_parent_id_idx" ON "social_profiles_items" USING btree ("_parent_id");
  CREATE INDEX "seo_defaults_og_image_idx" ON "seo_defaults" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "seo_defaults_locales_locale_parent_id_unique" ON "seo_defaults_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "seo_defaults_locales_parent_id_idx" ON "seo_defaults_locales" USING btree ("_parent_id");
  CREATE INDEX "consultation_settings_budget_bands_order_idx" ON "consultation_settings_budget_bands" USING btree ("_order");
  CREATE INDEX "consultation_settings_budget_bands_parent_id_idx" ON "consultation_settings_budget_bands" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "consultation_settings_budget_bands_locales_locale_parent_id_" ON "consultation_settings_budget_bands_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "consultation_settings_budget_bands_locales_parent_id_idx" ON "consultation_settings_budget_bands_locales" USING btree ("_parent_id");
  CREATE INDEX "consultation_settings_routing_rules_order_idx" ON "consultation_settings_routing_rules" USING btree ("_order");
  CREATE INDEX "consultation_settings_routing_rules_parent_id_idx" ON "consultation_settings_routing_rules" USING btree ("_parent_id");
  CREATE INDEX "consultation_settings_routing_rules_sector_idx" ON "consultation_settings_routing_rules" USING btree ("sector_id");
  CREATE INDEX "consultation_settings_routing_rules_assignee_idx" ON "consultation_settings_routing_rules" USING btree ("assignee_id");
  CREATE UNIQUE INDEX "consultation_settings_locales_locale_parent_id_unique" ON "consultation_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "consultation_settings_locales_parent_id_idx" ON "consultation_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "integrations_secret_names_order_idx" ON "integrations_secret_names" USING btree ("_order");
  CREATE INDEX "integrations_secret_names_parent_id_idx" ON "integrations_secret_names" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sectors_fk" FOREIGN KEY ("sectors_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_property_types_fk" FOREIGN KEY ("property_types_id") REFERENCES "public"."property_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_journal_posts_fk" FOREIGN KEY ("journal_posts_id") REFERENCES "public"."journal_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_journal_categories_fk" FOREIGN KEY ("journal_categories_id") REFERENCES "public"."journal_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_facts_fk" FOREIGN KEY ("facts_id") REFERENCES "public"."facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_sectors_id_idx" ON "payload_locked_documents_rels" USING btree ("sectors_id");
  CREATE INDEX "payload_locked_documents_rels_property_types_id_idx" ON "payload_locked_documents_rels" USING btree ("property_types_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("awards_id");
  CREATE INDEX "payload_locked_documents_rels_journal_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("journal_posts_id");
  CREATE INDEX "payload_locked_documents_rels_journal_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("journal_categories_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_facts_id_idx" ON "payload_locked_documents_rels" USING btree ("facts_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_totp_recovery_codes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_before_after_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_plans_hotspots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_plans_hotspots_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_before_after_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_plans_hotspots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_plans_hotspots_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_scope" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_deliverables" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_scope" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_deliverables" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectors_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sectors_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "property_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "property_types_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members_credentials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v_version_credentials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_team_members_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "awards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "journal_posts_citations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "journal_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "journal_posts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "journal_posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_journal_posts_v_version_citations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_journal_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_journal_posts_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_journal_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "journal_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "journal_categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_info_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_profiles_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "seo_defaults" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "seo_defaults_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "consultation_settings_budget_bands" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "consultation_settings_budget_bands_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "consultation_settings_routing_rules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "consultation_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "consultation_settings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legal_entity" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "integrations_secret_names" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "integrations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_totp_recovery_codes" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "projects_before_after" CASCADE;
  DROP TABLE "projects_before_after_locales" CASCADE;
  DROP TABLE "projects_plans_hotspots" CASCADE;
  DROP TABLE "projects_plans_hotspots_locales" CASCADE;
  DROP TABLE "projects_plans" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_before_after" CASCADE;
  DROP TABLE "_projects_v_version_before_after_locales" CASCADE;
  DROP TABLE "_projects_v_version_plans_hotspots" CASCADE;
  DROP TABLE "_projects_v_version_plans_hotspots_locales" CASCADE;
  DROP TABLE "_projects_v_version_plans" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "services_scope" CASCADE;
  DROP TABLE "services_deliverables" CASCADE;
  DROP TABLE "services_process_steps" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_scope" CASCADE;
  DROP TABLE "_services_v_version_deliverables" CASCADE;
  DROP TABLE "_services_v_version_process_steps" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "sectors" CASCADE;
  DROP TABLE "sectors_locales" CASCADE;
  DROP TABLE "sectors_rels" CASCADE;
  DROP TABLE "_sectors_v" CASCADE;
  DROP TABLE "_sectors_v_locales" CASCADE;
  DROP TABLE "_sectors_v_rels" CASCADE;
  DROP TABLE "property_types" CASCADE;
  DROP TABLE "property_types_locales" CASCADE;
  DROP TABLE "team_members_credentials" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "team_members_locales" CASCADE;
  DROP TABLE "_team_members_v_version_credentials" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "_team_members_v_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "clients" CASCADE;
  DROP TABLE "awards" CASCADE;
  DROP TABLE "journal_posts_citations" CASCADE;
  DROP TABLE "journal_posts" CASCADE;
  DROP TABLE "journal_posts_locales" CASCADE;
  DROP TABLE "journal_posts_rels" CASCADE;
  DROP TABLE "_journal_posts_v_version_citations" CASCADE;
  DROP TABLE "_journal_posts_v" CASCADE;
  DROP TABLE "_journal_posts_v_locales" CASCADE;
  DROP TABLE "_journal_posts_v_rels" CASCADE;
  DROP TABLE "journal_categories" CASCADE;
  DROP TABLE "journal_categories_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "facts" CASCADE;
  DROP TABLE "facts_locales" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "enquiries_texts" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation_items_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "footer_links" CASCADE;
  DROP TABLE "footer_links_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "contact_info" CASCADE;
  DROP TABLE "contact_info_locales" CASCADE;
  DROP TABLE "social_profiles_items" CASCADE;
  DROP TABLE "social_profiles" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  DROP TABLE "seo_defaults_locales" CASCADE;
  DROP TABLE "consultation_settings_budget_bands" CASCADE;
  DROP TABLE "consultation_settings_budget_bands_locales" CASCADE;
  DROP TABLE "consultation_settings_routing_rules" CASCADE;
  DROP TABLE "consultation_settings" CASCADE;
  DROP TABLE "consultation_settings_locales" CASCADE;
  DROP TABLE "legal_entity" CASCADE;
  DROP TABLE "integrations_secret_names" CASCADE;
  DROP TABLE "integrations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sectors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_property_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_members_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_clients_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_awards_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_journal_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_journal_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faqs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_facts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_log_fk";
  
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_sectors_id_idx";
  DROP INDEX "payload_locked_documents_rels_property_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_members_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  DROP INDEX "payload_locked_documents_rels_clients_id_idx";
  DROP INDEX "payload_locked_documents_rels_awards_id_idx";
  DROP INDEX "payload_locked_documents_rels_journal_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_journal_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_faqs_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_facts_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  DROP INDEX "payload_locked_documents_rels_audit_log_id_idx";
  ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "totp_enabled";
  ALTER TABLE "users" DROP COLUMN "totp_secret";
  ALTER TABLE "users" DROP COLUMN "totp_failed_attempts";
  ALTER TABLE "users" DROP COLUMN "totp_locked_until";
  ALTER TABLE "users" DROP COLUMN "last_login_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sectors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "property_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_members_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clients_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "awards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "journal_posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "journal_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faqs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "facts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_log_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_projects_stage";
  DROP TYPE "public"."enum_projects_workflow_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_stage";
  DROP TYPE "public"."enum__projects_v_version_workflow_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_services_workflow_status";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_workflow_status";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_sectors_workflow_status";
  DROP TYPE "public"."enum_sectors_status";
  DROP TYPE "public"."enum__sectors_v_version_workflow_status";
  DROP TYPE "public"."enum__sectors_v_version_status";
  DROP TYPE "public"."enum__sectors_v_published_locale";
  DROP TYPE "public"."enum_team_members_workflow_status";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_workflow_status";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum__team_members_v_published_locale";
  DROP TYPE "public"."enum_testimonials_workflow_status";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_workflow_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";
  DROP TYPE "public"."enum_journal_posts_workflow_status";
  DROP TYPE "public"."enum_journal_posts_status";
  DROP TYPE "public"."enum__journal_posts_v_version_workflow_status";
  DROP TYPE "public"."enum__journal_posts_v_version_status";
  DROP TYPE "public"."enum__journal_posts_v_published_locale";
  DROP TYPE "public"."enum_pages_workflow_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_workflow_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_facts_status";
  DROP TYPE "public"."enum_enquiries_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}

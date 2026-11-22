import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'contacted', 'site_visit', 'proposal_sent', 'won', 'lost');
  CREATE TYPE "public"."enum_enquiries_priority" AS ENUM('low', 'normal', 'high');
  CREATE TYPE "public"."enum_site_settings_banner_tone" AS ENUM('info', 'maintenance');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'leadDigest' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'unassignedAlert' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'publishScheduled' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'leadDigest' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'unassignedAlert' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'publishScheduled' BEFORE 'schedulePublish';
  CREATE TABLE "media_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "enquiries_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"author_id" integer,
  	"text" varchar NOT NULL,
  	"at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "enquiries_activity" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"actor_id" integer,
  	"at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "enquiries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"enquiries_id" integer
  );
  
  CREATE TABLE "email_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"kind" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"link" varchar,
  	"read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "saved_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"query" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "not_found_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"count" numeric DEFAULT 1,
  	"last_seen_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "login_history" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"at" timestamp(3) with time zone NOT NULL,
  	"ip" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "notify_by_email" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "folder" varchar;
  ALTER TABLE "projects" ADD COLUMN "workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "projects" ADD COLUMN "workflow_scheduled_by_id" integer;
  ALTER TABLE "_projects_v" ADD COLUMN "version_workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_projects_v" ADD COLUMN "version_workflow_scheduled_by_id" integer;
  ALTER TABLE "services" ADD COLUMN "workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "services" ADD COLUMN "workflow_scheduled_by_id" integer;
  ALTER TABLE "_services_v" ADD COLUMN "version_workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_services_v" ADD COLUMN "version_workflow_scheduled_by_id" integer;
  ALTER TABLE "sectors" ADD COLUMN "workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "sectors" ADD COLUMN "workflow_scheduled_by_id" integer;
  ALTER TABLE "_sectors_v" ADD COLUMN "version_workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_sectors_v" ADD COLUMN "version_workflow_scheduled_by_id" integer;
  ALTER TABLE "team_members" ADD COLUMN "workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "team_members" ADD COLUMN "workflow_scheduled_by_id" integer;
  ALTER TABLE "_team_members_v" ADD COLUMN "version_workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_team_members_v" ADD COLUMN "version_workflow_scheduled_by_id" integer;
  ALTER TABLE "testimonials" ADD COLUMN "workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "testimonials" ADD COLUMN "workflow_scheduled_by_id" integer;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_workflow_scheduled_by_id" integer;
  ALTER TABLE "journal_posts" ADD COLUMN "workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "journal_posts" ADD COLUMN "workflow_scheduled_by_id" integer;
  ALTER TABLE "_journal_posts_v" ADD COLUMN "version_workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_journal_posts_v" ADD COLUMN "version_workflow_scheduled_by_id" integer;
  ALTER TABLE "pages" ADD COLUMN "workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "workflow_scheduled_by_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_workflow_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_workflow_scheduled_by_id" integer;
  ALTER TABLE "enquiries" ADD COLUMN "status" "enum_enquiries_status" DEFAULT 'new';
  ALTER TABLE "enquiries" ADD COLUMN "lost_reason" varchar;
  ALTER TABLE "enquiries" ADD COLUMN "priority" "enum_enquiries_priority" DEFAULT 'normal';
  ALTER TABLE "enquiries" ADD COLUMN "follow_up_at" timestamp(3) with time zone;
  ALTER TABLE "enquiries" ADD COLUMN "estimated_value" numeric;
  ALTER TABLE "enquiries" ADD COLUMN "is_test" boolean DEFAULT false;
  ALTER TABLE "enquiries" ADD COLUMN "unassigned_alert_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notifications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "saved_views_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "not_found_log_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "login_history_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "banner_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "banner_tone" "enum_site_settings_banner_tone" DEFAULT 'info';
  ALTER TABLE "site_settings" ADD COLUMN "admin_login_image_id" integer;
  ALTER TABLE "site_settings_locales" ADD COLUMN "banner_message" varchar;
  ALTER TABLE "integrations" ADD COLUMN "last_restore_drill" timestamp(3) with time zone;
  ALTER TABLE "media_texts" ADD CONSTRAINT "media_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_notes" ADD CONSTRAINT "enquiries_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries_notes" ADD CONSTRAINT "enquiries_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_activity" ADD CONSTRAINT "enquiries_activity_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries_activity" ADD CONSTRAINT "enquiries_activity_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_rels" ADD CONSTRAINT "enquiries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_rels" ADD CONSTRAINT "enquiries_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "saved_views" ADD CONSTRAINT "saved_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_texts_order_parent" ON "media_texts" USING btree ("order","parent_id");
  CREATE INDEX "enquiries_notes_order_idx" ON "enquiries_notes" USING btree ("_order");
  CREATE INDEX "enquiries_notes_parent_id_idx" ON "enquiries_notes" USING btree ("_parent_id");
  CREATE INDEX "enquiries_notes_author_idx" ON "enquiries_notes" USING btree ("author_id");
  CREATE INDEX "enquiries_activity_order_idx" ON "enquiries_activity" USING btree ("_order");
  CREATE INDEX "enquiries_activity_parent_id_idx" ON "enquiries_activity" USING btree ("_parent_id");
  CREATE INDEX "enquiries_activity_actor_idx" ON "enquiries_activity" USING btree ("actor_id");
  CREATE INDEX "enquiries_rels_order_idx" ON "enquiries_rels" USING btree ("order");
  CREATE INDEX "enquiries_rels_parent_idx" ON "enquiries_rels" USING btree ("parent_id");
  CREATE INDEX "enquiries_rels_path_idx" ON "enquiries_rels" USING btree ("path");
  CREATE INDEX "enquiries_rels_enquiries_id_idx" ON "enquiries_rels" USING btree ("enquiries_id");
  CREATE INDEX "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");
  CREATE INDEX "email_templates_created_at_idx" ON "email_templates" USING btree ("created_at");
  CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE INDEX "saved_views_user_idx" ON "saved_views" USING btree ("user_id");
  CREATE INDEX "saved_views_updated_at_idx" ON "saved_views" USING btree ("updated_at");
  CREATE INDEX "saved_views_created_at_idx" ON "saved_views" USING btree ("created_at");
  CREATE UNIQUE INDEX "not_found_log_path_idx" ON "not_found_log" USING btree ("path");
  CREATE INDEX "not_found_log_updated_at_idx" ON "not_found_log" USING btree ("updated_at");
  CREATE INDEX "not_found_log_created_at_idx" ON "not_found_log" USING btree ("created_at");
  CREATE INDEX "login_history_user_idx" ON "login_history" USING btree ("user_id");
  CREATE INDEX "login_history_updated_at_idx" ON "login_history" USING btree ("updated_at");
  CREATE INDEX "login_history_created_at_idx" ON "login_history" USING btree ("created_at");
  ALTER TABLE "projects" ADD CONSTRAINT "projects_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("version_workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("version_workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectors" ADD CONSTRAINT "sectors_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sectors_v" ADD CONSTRAINT "_sectors_v_version_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("version_workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("version_workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("version_workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journal_posts_v" ADD CONSTRAINT "_journal_posts_v_version_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("version_workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_workflow_scheduled_by_id_users_id_fk" FOREIGN KEY ("version_workflow_scheduled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_templates_fk" FOREIGN KEY ("email_templates_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_saved_views_fk" FOREIGN KEY ("saved_views_id") REFERENCES "public"."saved_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_not_found_log_fk" FOREIGN KEY ("not_found_log_id") REFERENCES "public"."not_found_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_login_history_fk" FOREIGN KEY ("login_history_id") REFERENCES "public"."login_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_admin_login_image_id_media_id_fk" FOREIGN KEY ("admin_login_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder");
  CREATE INDEX "projects_workflow_workflow_scheduled_by_idx" ON "projects" USING btree ("workflow_scheduled_by_id");
  CREATE INDEX "_projects_v_version_workflow_version_workflow_scheduled__idx" ON "_projects_v" USING btree ("version_workflow_scheduled_by_id");
  CREATE INDEX "services_workflow_workflow_scheduled_by_idx" ON "services" USING btree ("workflow_scheduled_by_id");
  CREATE INDEX "_services_v_version_workflow_version_workflow_scheduled__idx" ON "_services_v" USING btree ("version_workflow_scheduled_by_id");
  CREATE INDEX "sectors_workflow_workflow_scheduled_by_idx" ON "sectors" USING btree ("workflow_scheduled_by_id");
  CREATE INDEX "_sectors_v_version_workflow_version_workflow_scheduled_b_idx" ON "_sectors_v" USING btree ("version_workflow_scheduled_by_id");
  CREATE INDEX "team_members_workflow_workflow_scheduled_by_idx" ON "team_members" USING btree ("workflow_scheduled_by_id");
  CREATE INDEX "_team_members_v_version_workflow_version_workflow_schedu_idx" ON "_team_members_v" USING btree ("version_workflow_scheduled_by_id");
  CREATE INDEX "testimonials_workflow_workflow_scheduled_by_idx" ON "testimonials" USING btree ("workflow_scheduled_by_id");
  CREATE INDEX "_testimonials_v_version_workflow_version_workflow_schedu_idx" ON "_testimonials_v" USING btree ("version_workflow_scheduled_by_id");
  CREATE INDEX "journal_posts_workflow_workflow_scheduled_by_idx" ON "journal_posts" USING btree ("workflow_scheduled_by_id");
  CREATE INDEX "_journal_posts_v_version_workflow_version_workflow_sched_idx" ON "_journal_posts_v" USING btree ("version_workflow_scheduled_by_id");
  CREATE INDEX "pages_workflow_workflow_scheduled_by_idx" ON "pages" USING btree ("workflow_scheduled_by_id");
  CREATE INDEX "_pages_v_version_workflow_version_workflow_scheduled_by_idx" ON "_pages_v" USING btree ("version_workflow_scheduled_by_id");
  CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");
  CREATE INDEX "enquiries_follow_up_at_idx" ON "enquiries" USING btree ("follow_up_at");
  CREATE INDEX "payload_locked_documents_rels_email_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("email_templates_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_saved_views_id_idx" ON "payload_locked_documents_rels" USING btree ("saved_views_id");
  CREATE INDEX "payload_locked_documents_rels_not_found_log_id_idx" ON "payload_locked_documents_rels" USING btree ("not_found_log_id");
  CREATE INDEX "payload_locked_documents_rels_login_history_id_idx" ON "payload_locked_documents_rels" USING btree ("login_history_id");
  CREATE INDEX "site_settings_admin_login_image_idx" ON "site_settings" USING btree ("admin_login_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries_activity" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "saved_views" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "not_found_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "login_history" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_texts" CASCADE;
  DROP TABLE "enquiries_notes" CASCADE;
  DROP TABLE "enquiries_activity" CASCADE;
  DROP TABLE "enquiries_rels" CASCADE;
  DROP TABLE "email_templates" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "saved_views" CASCADE;
  DROP TABLE "not_found_log" CASCADE;
  DROP TABLE "login_history" CASCADE;
  ALTER TABLE "projects" DROP CONSTRAINT "projects_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "_services_v" DROP CONSTRAINT "_services_v_version_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "sectors" DROP CONSTRAINT "sectors_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "_sectors_v" DROP CONSTRAINT "_sectors_v_version_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "team_members" DROP CONSTRAINT "team_members_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "_team_members_v" DROP CONSTRAINT "_team_members_v_version_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "_testimonials_v" DROP CONSTRAINT "_testimonials_v_version_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "journal_posts" DROP CONSTRAINT "journal_posts_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "_journal_posts_v" DROP CONSTRAINT "_journal_posts_v_version_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_workflow_scheduled_by_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_templates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notifications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_saved_views_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_not_found_log_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_login_history_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_admin_login_image_id_media_id_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'deliverStaffEmail', 'sendConfirmation', 'deliverCrm', 'purgeEnquiries', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'deliverStaffEmail', 'sendConfirmation', 'deliverCrm', 'purgeEnquiries', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "media_folder_idx";
  DROP INDEX "projects_workflow_workflow_scheduled_by_idx";
  DROP INDEX "_projects_v_version_workflow_version_workflow_scheduled__idx";
  DROP INDEX "services_workflow_workflow_scheduled_by_idx";
  DROP INDEX "_services_v_version_workflow_version_workflow_scheduled__idx";
  DROP INDEX "sectors_workflow_workflow_scheduled_by_idx";
  DROP INDEX "_sectors_v_version_workflow_version_workflow_scheduled_b_idx";
  DROP INDEX "team_members_workflow_workflow_scheduled_by_idx";
  DROP INDEX "_team_members_v_version_workflow_version_workflow_schedu_idx";
  DROP INDEX "testimonials_workflow_workflow_scheduled_by_idx";
  DROP INDEX "_testimonials_v_version_workflow_version_workflow_schedu_idx";
  DROP INDEX "journal_posts_workflow_workflow_scheduled_by_idx";
  DROP INDEX "_journal_posts_v_version_workflow_version_workflow_sched_idx";
  DROP INDEX "pages_workflow_workflow_scheduled_by_idx";
  DROP INDEX "_pages_v_version_workflow_version_workflow_scheduled_by_idx";
  DROP INDEX "enquiries_status_idx";
  DROP INDEX "enquiries_follow_up_at_idx";
  DROP INDEX "payload_locked_documents_rels_email_templates_id_idx";
  DROP INDEX "payload_locked_documents_rels_notifications_id_idx";
  DROP INDEX "payload_locked_documents_rels_saved_views_id_idx";
  DROP INDEX "payload_locked_documents_rels_not_found_log_id_idx";
  DROP INDEX "payload_locked_documents_rels_login_history_id_idx";
  DROP INDEX "site_settings_admin_login_image_idx";
  ALTER TABLE "users" DROP COLUMN "notify_by_email";
  ALTER TABLE "media" DROP COLUMN "folder";
  ALTER TABLE "projects" DROP COLUMN "workflow_publish_at";
  ALTER TABLE "projects" DROP COLUMN "workflow_scheduled_by_id";
  ALTER TABLE "_projects_v" DROP COLUMN "version_workflow_publish_at";
  ALTER TABLE "_projects_v" DROP COLUMN "version_workflow_scheduled_by_id";
  ALTER TABLE "services" DROP COLUMN "workflow_publish_at";
  ALTER TABLE "services" DROP COLUMN "workflow_scheduled_by_id";
  ALTER TABLE "_services_v" DROP COLUMN "version_workflow_publish_at";
  ALTER TABLE "_services_v" DROP COLUMN "version_workflow_scheduled_by_id";
  ALTER TABLE "sectors" DROP COLUMN "workflow_publish_at";
  ALTER TABLE "sectors" DROP COLUMN "workflow_scheduled_by_id";
  ALTER TABLE "_sectors_v" DROP COLUMN "version_workflow_publish_at";
  ALTER TABLE "_sectors_v" DROP COLUMN "version_workflow_scheduled_by_id";
  ALTER TABLE "team_members" DROP COLUMN "workflow_publish_at";
  ALTER TABLE "team_members" DROP COLUMN "workflow_scheduled_by_id";
  ALTER TABLE "_team_members_v" DROP COLUMN "version_workflow_publish_at";
  ALTER TABLE "_team_members_v" DROP COLUMN "version_workflow_scheduled_by_id";
  ALTER TABLE "testimonials" DROP COLUMN "workflow_publish_at";
  ALTER TABLE "testimonials" DROP COLUMN "workflow_scheduled_by_id";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_workflow_publish_at";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_workflow_scheduled_by_id";
  ALTER TABLE "journal_posts" DROP COLUMN "workflow_publish_at";
  ALTER TABLE "journal_posts" DROP COLUMN "workflow_scheduled_by_id";
  ALTER TABLE "_journal_posts_v" DROP COLUMN "version_workflow_publish_at";
  ALTER TABLE "_journal_posts_v" DROP COLUMN "version_workflow_scheduled_by_id";
  ALTER TABLE "pages" DROP COLUMN "workflow_publish_at";
  ALTER TABLE "pages" DROP COLUMN "workflow_scheduled_by_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_workflow_publish_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_workflow_scheduled_by_id";
  ALTER TABLE "enquiries" DROP COLUMN "status";
  ALTER TABLE "enquiries" DROP COLUMN "lost_reason";
  ALTER TABLE "enquiries" DROP COLUMN "priority";
  ALTER TABLE "enquiries" DROP COLUMN "follow_up_at";
  ALTER TABLE "enquiries" DROP COLUMN "estimated_value";
  ALTER TABLE "enquiries" DROP COLUMN "is_test";
  ALTER TABLE "enquiries" DROP COLUMN "unassigned_alert_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_templates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notifications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "saved_views_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "not_found_log_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "login_history_id";
  ALTER TABLE "site_settings" DROP COLUMN "banner_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "banner_tone";
  ALTER TABLE "site_settings" DROP COLUMN "admin_login_image_id";
  ALTER TABLE "site_settings_locales" DROP COLUMN "banner_message";
  ALTER TABLE "integrations" DROP COLUMN "last_restore_drill";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_enquiries_priority";
  DROP TYPE "public"."enum_site_settings_banner_tone";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "dashboard_layout" jsonb;
  ALTER TABLE "enquiries" ADD COLUMN "attribution" jsonb;
  ALTER TABLE "enquiries" ADD COLUMN "score" numeric;
  ALTER TABLE "enquiries" ADD COLUMN "score_reasons" jsonb;
  ALTER TABLE "enquiries" ADD COLUMN "first_contact_at" timestamp(3) with time zone;
  ALTER TABLE "consultation_settings" ADD COLUMN "crm_monthly_lead_goal" numeric;
  ALTER TABLE "consultation_settings" ADD COLUMN "crm_sla_hours" numeric DEFAULT 4;
  ALTER TABLE "consultation_settings" ADD COLUMN "crm_prob_new" numeric DEFAULT 10;
  ALTER TABLE "consultation_settings" ADD COLUMN "crm_prob_contacted" numeric DEFAULT 25;
  ALTER TABLE "consultation_settings" ADD COLUMN "crm_prob_site_visit" numeric DEFAULT 50;
  ALTER TABLE "consultation_settings" ADD COLUMN "crm_prob_proposal" numeric DEFAULT 70;
  CREATE INDEX "enquiries_score_idx" ON "enquiries" USING btree ("score");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "enquiries_score_idx";
  ALTER TABLE "users" DROP COLUMN "dashboard_layout";
  ALTER TABLE "enquiries" DROP COLUMN "attribution";
  ALTER TABLE "enquiries" DROP COLUMN "score";
  ALTER TABLE "enquiries" DROP COLUMN "score_reasons";
  ALTER TABLE "enquiries" DROP COLUMN "first_contact_at";
  ALTER TABLE "consultation_settings" DROP COLUMN "crm_monthly_lead_goal";
  ALTER TABLE "consultation_settings" DROP COLUMN "crm_sla_hours";
  ALTER TABLE "consultation_settings" DROP COLUMN "crm_prob_new";
  ALTER TABLE "consultation_settings" DROP COLUMN "crm_prob_contacted";
  ALTER TABLE "consultation_settings" DROP COLUMN "crm_prob_site_visit";
  ALTER TABLE "consultation_settings" DROP COLUMN "crm_prob_proposal";`)
}

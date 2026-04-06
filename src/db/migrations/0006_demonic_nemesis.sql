CREATE TYPE "public"."inbound_email_type" AS ENUM('bandcamp_import', 'gmail_forwarding_verification');--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD COLUMN "email_type" "inbound_email_type" DEFAULT 'bandcamp_import' NOT NULL;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD COLUMN "gmail_forwarding_confirmation_url" text;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD COLUMN "gmail_forwarding_confirmation_code" text;--> statement-breakpoint
CREATE INDEX "inbound_emails_user_id_email_type_idx" ON "inbound_emails" USING btree ("user_id","email_type");
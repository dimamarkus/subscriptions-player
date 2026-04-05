CREATE TYPE "public"."inbound_email_parse_status" AS ENUM('processing', 'parsed', 'parsed_with_fallback', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_release_status" AS ENUM('new', 'listened', 'saved', 'skipped', 'archived');--> statement-breakpoint
CREATE TABLE "inbound_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"resend_email_id" text NOT NULL,
	"message_id_header" text,
	"from_email" text NOT NULL,
	"to_email" text NOT NULL,
	"subject" text NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"headers_json" jsonb,
	"raw_links_json" jsonb NOT NULL,
	"parse_status" "inbound_email_parse_status" DEFAULT 'processing' NOT NULL,
	"parse_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "release_import_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_release_id" uuid NOT NULL,
	"inbound_email_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_url" text NOT NULL,
	"bandcamp_domain" text NOT NULL,
	"artist_name" text,
	"release_title" text,
	"release_type" text NOT NULL,
	"resolved_status" text DEFAULT 'url_only' NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"release_id" uuid NOT NULL,
	"status" "user_release_status" DEFAULT 'new' NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"import_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_events" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "webhook_events" ALTER COLUMN "status" SET DEFAULT 'received'::text;--> statement-breakpoint
DROP TYPE "public"."webhook_event_status";--> statement-breakpoint
CREATE TYPE "public"."webhook_event_status" AS ENUM('received', 'queued', 'processing', 'imported', 'failed');--> statement-breakpoint
ALTER TABLE "webhook_events" ALTER COLUMN "status" SET DEFAULT 'received'::"public"."webhook_event_status";--> statement-breakpoint
ALTER TABLE "webhook_events" ALTER COLUMN "status" SET DATA TYPE "public"."webhook_event_status" USING "status"::"public"."webhook_event_status";--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_webhook_event_id_webhook_events_id_fk" FOREIGN KEY ("webhook_event_id") REFERENCES "public"."webhook_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_import_occurrences" ADD CONSTRAINT "release_import_occurrences_user_release_id_user_releases_id_fk" FOREIGN KEY ("user_release_id") REFERENCES "public"."user_releases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_import_occurrences" ADD CONSTRAINT "release_import_occurrences_inbound_email_id_inbound_emails_id_fk" FOREIGN KEY ("inbound_email_id") REFERENCES "public"."inbound_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_releases" ADD CONSTRAINT "user_releases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_releases" ADD CONSTRAINT "user_releases_release_id_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "inbound_emails_resend_email_id_unique_idx" ON "inbound_emails" USING btree ("resend_email_id");--> statement-breakpoint
CREATE INDEX "inbound_emails_user_id_idx" ON "inbound_emails" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inbound_emails_webhook_event_id_idx" ON "inbound_emails" USING btree ("webhook_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "release_import_occurrences_unique_idx" ON "release_import_occurrences" USING btree ("user_release_id","inbound_email_id");--> statement-breakpoint
CREATE UNIQUE INDEX "releases_canonical_url_unique_idx" ON "releases" USING btree ("canonical_url");--> statement-breakpoint
CREATE UNIQUE INDEX "user_releases_user_release_unique_idx" ON "user_releases" USING btree ("user_id","release_id");--> statement-breakpoint
CREATE INDEX "user_releases_user_id_idx" ON "user_releases" USING btree ("user_id");
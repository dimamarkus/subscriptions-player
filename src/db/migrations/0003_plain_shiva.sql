CREATE TYPE "public"."webhook_event_status" AS ENUM('received', 'queued', 'processing', 'awaiting_import', 'failed');--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"event_type" text NOT NULL,
	"provider_event_id" text NOT NULL,
	"payload_json" jsonb NOT NULL,
	"status" "webhook_event_status" DEFAULT 'received' NOT NULL,
	"queue_message_id" text,
	"error" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_unique_idx" ON "webhook_events" USING btree ("provider","event_type","provider_event_id");
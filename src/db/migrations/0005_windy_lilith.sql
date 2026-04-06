ALTER TABLE "releases" ADD COLUMN "bandcamp_item_id" text;--> statement-breakpoint
ALTER TABLE "releases" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "releases" ADD COLUMN "embed_url" text;--> statement-breakpoint
ALTER TABLE "releases" ADD COLUMN "enriched_at" timestamp with time zone;
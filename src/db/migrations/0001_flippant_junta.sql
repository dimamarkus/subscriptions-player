CREATE TYPE "public"."inbound_alias_status" AS ENUM('active', 'rotated');--> statement-breakpoint
CREATE TABLE "inbound_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"status" "inbound_alias_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rotated_at" timestamp with time zone,
	CONSTRAINT "inbound_aliases_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "inbound_aliases" ADD CONSTRAINT "inbound_aliases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inbound_aliases_user_id_idx" ON "inbound_aliases" USING btree ("user_id");
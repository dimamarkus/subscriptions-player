import { uniqueIndex } from "drizzle-orm/pg-core";
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const webhookEventStatusEnum = pgEnum("webhook_event_status", [
  "received",
  "queued",
  "processing",
  "imported",
  "failed",
]);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    eventType: text("event_type").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    payloadJson: jsonb("payload_json").notNull(),
    status: webhookEventStatusEnum("status").notNull().default("received"),
    queueMessageId: text("queue_message_id"),
    error: text("error"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("webhook_events_provider_unique_idx").on(
      table.provider,
      table.eventType,
      table.providerEventId,
    ),
  ],
);

export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
export type SelectWebhookEvent = typeof webhookEvents.$inferSelect;

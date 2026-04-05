import { index } from "drizzle-orm/pg-core";
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { webhookEvents } from "./webhook-events";

export const inboundEmailParseStatusEnum = pgEnum("inbound_email_parse_status", [
  "processing",
  "parsed",
  "parsed_with_fallback",
  "failed",
]);

export const inboundEmails = pgTable(
  "inbound_emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    webhookEventId: uuid("webhook_event_id")
      .notNull()
      .references(() => webhookEvents.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resendEmailId: text("resend_email_id").notNull(),
    messageIdHeader: text("message_id_header"),
    fromEmail: text("from_email").notNull(),
    toEmail: text("to_email").notNull(),
    subject: text("subject").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    headersJson: jsonb("headers_json"),
    rawLinksJson: jsonb("raw_links_json").notNull(),
    parseStatus: inboundEmailParseStatusEnum("parse_status")
      .notNull()
      .default("processing"),
    parseError: text("parse_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("inbound_emails_resend_email_id_unique_idx").on(
      table.resendEmailId,
    ),
    index("inbound_emails_user_id_idx").on(table.userId),
    index("inbound_emails_webhook_event_id_idx").on(table.webhookEventId),
  ],
);

export type InsertInboundEmail = typeof inboundEmails.$inferInsert;
export type SelectInboundEmail = typeof inboundEmails.$inferSelect;

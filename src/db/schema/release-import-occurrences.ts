import { uniqueIndex } from "drizzle-orm/pg-core";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { inboundEmails } from "./inbound-emails";
import { userReleases } from "./user-releases";

export const releaseImportOccurrences = pgTable(
  "release_import_occurrences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userReleaseId: uuid("user_release_id")
      .notNull()
      .references(() => userReleases.id, { onDelete: "cascade" }),
    inboundEmailId: uuid("inbound_email_id")
      .notNull()
      .references(() => inboundEmails.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("release_import_occurrences_unique_idx").on(
      table.userReleaseId,
      table.inboundEmailId,
    ),
  ],
);

export type InsertReleaseImportOccurrence =
  typeof releaseImportOccurrences.$inferInsert;
export type SelectReleaseImportOccurrence =
  typeof releaseImportOccurrences.$inferSelect;

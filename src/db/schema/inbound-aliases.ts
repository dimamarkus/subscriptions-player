import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const inboundAliasStatusEnum = pgEnum("inbound_alias_status", [
  "active",
  "rotated",
]);

export const inboundAliases = pgTable(
  "inbound_aliases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    status: inboundAliasStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    rotatedAt: timestamp("rotated_at", { withTimezone: true }),
  },
  (table) => [
    index("inbound_aliases_user_id_idx").on(table.userId),
    uniqueIndex("inbound_aliases_active_user_idx")
      .on(table.userId)
      .where(sql`${table.status} = 'active'`),
  ],
);

export type InsertInboundAlias = typeof inboundAliases.$inferInsert;
export type SelectInboundAlias = typeof inboundAliases.$inferSelect;

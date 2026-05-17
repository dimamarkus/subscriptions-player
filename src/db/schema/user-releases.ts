import { sql } from "drizzle-orm";
import { check, index } from "drizzle-orm/pg-core";
import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { releases } from "./releases";
import { users } from "./users";

export const userReleaseStatusEnum = pgEnum("user_release_status", [
  "new",
  "listened",
  "saved",
  "skipped",
  "archived",
]);

export const userReleases = pgTable(
  "user_releases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    releaseId: uuid("release_id")
      .notNull()
      .references(() => releases.id, { onDelete: "cascade" }),
    status: userReleaseStatusEnum("status").notNull().default("new"),
    ratingHalfSteps: integer("rating_half_steps"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    importCount: integer("import_count").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("user_releases_user_release_unique_idx").on(
      table.userId,
      table.releaseId,
    ),
    index("user_releases_user_id_idx").on(table.userId),
    check(
      "user_releases_rating_half_steps_check",
      sql`${table.ratingHalfSteps} is null or ${table.ratingHalfSteps} between 2 and 10`,
    ),
  ],
);

export type InsertUserRelease = typeof userReleases.$inferInsert;
export type SelectUserRelease = typeof userReleases.$inferSelect;

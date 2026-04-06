import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const releases = pgTable(
  "releases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    canonicalUrl: text("canonical_url").notNull(),
    bandcampDomain: text("bandcamp_domain").notNull(),
    bandcampItemId: text("bandcamp_item_id"),
    artistName: text("artist_name"),
    releaseTitle: text("release_title"),
    releaseType: text("release_type").notNull(),
    coverImageUrl: text("cover_image_url"),
    embedUrl: text("embed_url"),
    resolvedStatus: text("resolved_status").notNull().default("url_only"),
    metadataJson: jsonb("metadata_json"),
    enrichedAt: timestamp("enriched_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("releases_canonical_url_unique_idx").on(table.canonicalUrl),
  ],
);

export type InsertRelease = typeof releases.$inferInsert;
export type SelectRelease = typeof releases.$inferSelect;

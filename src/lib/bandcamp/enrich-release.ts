import "server-only";
import { eq } from "drizzle-orm";

import { fetchBandcampPageHtml } from "@/lib/bandcamp/fetch-bandcamp-page-html";
import { extractBandcampPageMetadata } from "@/lib/bandcamp/extract-bandcamp-page-metadata";
import { getDb } from "@/db/client";
import { releases } from "@/db/schema";

type EnrichReleaseInput = {
  releaseId: string;
  canonicalUrl: string;
  releaseType: "album" | "track";
};

export async function enrichRelease({
  releaseId,
  canonicalUrl,
  releaseType,
}: EnrichReleaseInput) {
  const html = await fetchBandcampPageHtml(canonicalUrl);
  const metadata = extractBandcampPageMetadata({
    canonicalUrl,
    html,
    releaseType,
  });

  const [updatedRelease] = await getDb()
    .update(releases)
    .set({
      bandcampItemId: metadata.bandcampItemId,
      artistName: metadata.artistName,
      releaseTitle: metadata.releaseTitle,
      coverImageUrl: metadata.coverImageUrl,
      embedUrl: metadata.embedUrl,
      metadataJson: metadata.metadataJson,
      resolvedStatus: metadata.embedUrl ? "embed_ready" : "metadata_enriched",
      enrichedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(releases.id, releaseId))
    .returning();

  return updatedRelease;
}

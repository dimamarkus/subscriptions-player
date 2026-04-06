import "server-only";
import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { releases, userReleases } from "@/db/schema";

export async function listUserQueueItems(userId: string) {
  return getDb()
    .select({
      releaseId: releases.id,
      userReleaseId: userReleases.id,
      status: userReleases.status,
      firstSeenAt: userReleases.firstSeenAt,
      lastSeenAt: userReleases.lastSeenAt,
      importCount: userReleases.importCount,
      canonicalUrl: releases.canonicalUrl,
      bandcampDomain: releases.bandcampDomain,
      artistName: releases.artistName,
      releaseTitle: releases.releaseTitle,
      releaseType: releases.releaseType,
      coverImageUrl: releases.coverImageUrl,
      embedUrl: releases.embedUrl,
      resolvedStatus: releases.resolvedStatus,
    })
    .from(userReleases)
    .innerJoin(releases, eq(userReleases.releaseId, releases.id))
    .where(eq(userReleases.userId, userId))
    .orderBy(desc(userReleases.lastSeenAt));
}

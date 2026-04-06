import "server-only";
import { and, count, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { releases, userReleases } from "@/db/schema";
import {
  ALL_QUEUE_STATUS_FILTER,
  type QueueStatusFilter,
} from "@/lib/releases/user-release-status";

type ListUserQueueItemsInput = {
  userId: string;
  status: QueueStatusFilter;
  page: number;
  pageSize: number;
};

export async function listUserQueueItems({
  userId,
  status,
  page,
  pageSize,
}: ListUserQueueItemsInput) {
  const filters =
    status === ALL_QUEUE_STATUS_FILTER
      ? [eq(userReleases.userId, userId)]
      : [eq(userReleases.userId, userId), eq(userReleases.status, status)];
  const whereClause = filters.length === 1 ? filters[0] : and(...filters);
  const [{ totalCount }] = await getDb()
    .select({ totalCount: count() })
    .from(userReleases)
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const items = await getDb()
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
    .where(whereClause)
    .orderBy(desc(userReleases.lastSeenAt))
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);

  return {
    items,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  };
}

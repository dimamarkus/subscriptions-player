import "server-only";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { inboundEmails, releaseImportOccurrences, releases, userReleases } from "@/db/schema";
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

  const userReleaseIds = items.map((item) => item.userReleaseId);
  const originalDatesByUserReleaseId = new Map<string, string>();

  if (userReleaseIds.length > 0) {
    const originalDates = await getDb()
      .select({
        userReleaseId: releaseImportOccurrences.userReleaseId,
        originalEmailSentOn: sql<string | null>`
          min(
            coalesce(
              ${inboundEmails.originalEmailSentOn},
              (${inboundEmails.receivedAt})::date
            )
          )
        `,
      })
      .from(releaseImportOccurrences)
      .innerJoin(
        inboundEmails,
        eq(releaseImportOccurrences.inboundEmailId, inboundEmails.id),
      )
      .where(inArray(releaseImportOccurrences.userReleaseId, userReleaseIds))
      .groupBy(releaseImportOccurrences.userReleaseId);

    for (const row of originalDates) {
      if (row.originalEmailSentOn) {
        originalDatesByUserReleaseId.set(
          row.userReleaseId,
          row.originalEmailSentOn,
        );
      }
    }
  }

  return {
    items: items.map((item) => ({
      ...item,
      originalEmailSentOn:
        originalDatesByUserReleaseId.get(item.userReleaseId) ?? null,
    })),
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  };
}

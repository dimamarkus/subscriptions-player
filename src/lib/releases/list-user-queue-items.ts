import "server-only";
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { inboundEmails, releaseImportOccurrences, releases, userReleases } from "@/db/schema";
import {
  ALL_QUEUE_MONTH_FILTER,
  ALL_QUEUE_SOURCE_FILTER,
  UNDATED_QUEUE_MONTH_FILTER,
  type QueueMonthFilter,
  type QueueSourceFilter,
} from "@/lib/releases/queue-filters";
import {
  ALL_QUEUE_STATUS_FILTER,
  type QueueStatusFilter,
} from "@/lib/releases/user-release-status";

type ListUserQueueItemsInput = {
  userId: string;
  status: QueueStatusFilter;
  month: QueueMonthFilter;
  source: QueueSourceFilter;
  page: number;
  pageSize: number;
};

export async function listUserQueueItems({
  userId,
  status,
  month,
  source,
  page,
  pageSize,
}: ListUserQueueItemsInput) {
  const db = getDb();
  const originalEmailDates = db
    .select({
      userReleaseId: releaseImportOccurrences.userReleaseId,
      originalEmailSentOn: sql<string | null>`
        min(
          coalesce(
            ${inboundEmails.originalEmailSentOn},
            (${inboundEmails.receivedAt})::date
          )
        )
      `.as("original_email_sent_on"),
      originalEmailMonth:
        sql<string | null>`
          to_char(
            date_trunc(
              'month',
              min(
                coalesce(
                  ${inboundEmails.originalEmailSentOn},
                  (${inboundEmails.receivedAt})::date
                )
              )
            ),
            'YYYY-MM'
          )
        `.as("original_email_month"),
    })
    .from(releaseImportOccurrences)
    .innerJoin(
      inboundEmails,
      eq(releaseImportOccurrences.inboundEmailId, inboundEmails.id),
    )
    .groupBy(releaseImportOccurrences.userReleaseId)
    .as("original_email_dates");

  function buildWhereClause(filterValues: {
    month: QueueMonthFilter;
    source: QueueSourceFilter;
  }) {
    const filters = [eq(userReleases.userId, userId)];

    if (status !== ALL_QUEUE_STATUS_FILTER) {
      filters.push(eq(userReleases.status, status));
    }

    if (filterValues.source !== ALL_QUEUE_SOURCE_FILTER) {
      filters.push(eq(releases.bandcampDomain, filterValues.source));
    }

    if (filterValues.month === UNDATED_QUEUE_MONTH_FILTER) {
      filters.push(isNull(originalEmailDates.originalEmailMonth));
    } else if (filterValues.month !== ALL_QUEUE_MONTH_FILTER) {
      filters.push(eq(originalEmailDates.originalEmailMonth, filterValues.month));
    }

    return filters.length === 1 ? filters[0] : and(...filters);
  }

  const whereClause = buildWhereClause({ month, source });
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(userReleases)
    .innerJoin(releases, eq(userReleases.releaseId, releases.id))
    .leftJoin(originalEmailDates, eq(originalEmailDates.userReleaseId, userReleases.id))
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const items = await db
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
      originalEmailSentOn: originalEmailDates.originalEmailSentOn,
    })
    .from(userReleases)
    .innerJoin(releases, eq(userReleases.releaseId, releases.id))
    .leftJoin(originalEmailDates, eq(originalEmailDates.userReleaseId, userReleases.id))
    .where(whereClause)
    .orderBy(desc(userReleases.lastSeenAt))
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);
  const availableMonthRows = await db
    .select({
      originalEmailMonth: originalEmailDates.originalEmailMonth,
    })
    .from(userReleases)
    .innerJoin(releases, eq(userReleases.releaseId, releases.id))
    .leftJoin(originalEmailDates, eq(originalEmailDates.userReleaseId, userReleases.id))
    .where(
      buildWhereClause({
        month: ALL_QUEUE_MONTH_FILTER,
        source,
      }),
    )
    .groupBy(originalEmailDates.originalEmailMonth)
    .orderBy(sql`${originalEmailDates.originalEmailMonth} desc nulls last`);

  const availableSourceRows = await db
    .select({
      source: releases.bandcampDomain,
    })
    .from(userReleases)
    .innerJoin(releases, eq(userReleases.releaseId, releases.id))
    .leftJoin(originalEmailDates, eq(originalEmailDates.userReleaseId, userReleases.id))
    .where(
      buildWhereClause({
        month,
        source: ALL_QUEUE_SOURCE_FILTER,
      }),
    )
    .groupBy(releases.bandcampDomain)
    .orderBy(asc(releases.bandcampDomain));

  return {
    items,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    availableMonths: availableMonthRows.map((row) =>
      row.originalEmailMonth ?? UNDATED_QUEUE_MONTH_FILTER,
    ),
    availableSources: availableSourceRows.map((row) => row.source),
  };
}

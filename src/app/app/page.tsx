import Link from "next/link";
import { redirect } from "next/navigation";

import { BandcampEmbedPlayer } from "@/components/bandcamp-embed-player";
import { QueueItemStatusBadge } from "@/components/queue-item-status-badge";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { getBandcampDomainLabel } from "@/lib/bandcamp/get-bandcamp-domain-label";
import { formatIsoDateLabel } from "@/lib/dates/format-iso-date-label";
import { formatIsoMonthLabel } from "@/lib/dates/format-iso-month-label";
import { getActiveInboundAlias } from "@/lib/inbound-aliases/get-active-inbound-alias";
import { listUserQueueItems } from "@/lib/releases/list-user-queue-items";
import {
  ALL_QUEUE_MONTH_FILTER,
  ALL_QUEUE_SOURCE_FILTER,
  UNDATED_QUEUE_MONTH_FILTER,
  buildQueueSearchParams,
  parseQueueFilters,
  type QueueMonthFilter,
  type QueueSourceFilter,
} from "@/lib/releases/queue-filters";
import {
  ALL_QUEUE_STATUS_FILTER,
  DEFAULT_QUEUE_STATUS_FILTER,
  QUEUE_STATUS_FILTER_OPTIONS,
  type QueueStatusFilter,
} from "@/lib/releases/user-release-status";

const QUEUE_PAGE_SIZE = 24;

type AppHomePageProps = {
  searchParams: Promise<{
    page?: string | string[];
    status?: string | string[];
    month?: string | string[];
    source?: string | string[];
  }>;
};

function getQueueHref({
  status = DEFAULT_QUEUE_STATUS_FILTER,
  month = ALL_QUEUE_MONTH_FILTER,
  source = ALL_QUEUE_SOURCE_FILTER,
  page = 1,
}: {
  status?: QueueStatusFilter;
  month?: QueueMonthFilter;
  source?: QueueSourceFilter;
  page?: number;
}) {
  const query = buildQueueSearchParams({
    status,
    month,
    source,
    page,
  }).toString();

  return query ? `/app?${query}` : "/app";
}

export default async function AppHomePage({ searchParams }: AppHomePageProps) {
  const params = await searchParams;
  const currentUser = await ensureAppUser();
  const inboundAlias = await getActiveInboundAlias(currentUser.id);

  if (!inboundAlias) {
    redirect("/app/settings");
  }

  const {
    status: selectedStatus,
    month: selectedMonth,
    source: selectedSource,
    page: requestedPage,
  } = parseQueueFilters(params);
  const queueResult = await listUserQueueItems({
    userId: currentUser.id,
    status: selectedStatus,
    month: selectedMonth,
    source: selectedSource,
    page: requestedPage,
    pageSize: QUEUE_PAGE_SIZE,
  });
  const queueItems = queueResult.items;
  const availableMonths = queueResult.availableMonths.includes(selectedMonth)
    ? queueResult.availableMonths
    : selectedMonth === ALL_QUEUE_MONTH_FILTER
      ? queueResult.availableMonths
      : [selectedMonth, ...queueResult.availableMonths];
  const availableSources = queueResult.availableSources.includes(selectedSource)
    ? queueResult.availableSources
    : selectedSource === ALL_QUEUE_SOURCE_FILTER
      ? queueResult.availableSources
      : [selectedSource, ...queueResult.availableSources];
  const hasActiveSecondaryFilters =
    selectedMonth !== ALL_QUEUE_MONTH_FILTER ||
    selectedSource !== ALL_QUEUE_SOURCE_FILTER;
  const resultLabel =
    selectedStatus === ALL_QUEUE_STATUS_FILTER ? "all releases" : `${selectedStatus} releases`;
  const emptyStateLabel =
    selectedStatus === ALL_QUEUE_STATUS_FILTER ? "releases" : `${selectedStatus} releases`;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Queue
        </p>
        <h1 className="text-3xl font-semibold text-white">Listening queue</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {QUEUE_STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = option.value === selectedStatus;

          return (
            <Link
              key={option.value}
              href={getQueueHref({
                status: option.value,
                month: selectedMonth,
                source: selectedSource,
              })}
              className={
                isActive
                  ? "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
              }
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
        <form
          key={`${selectedStatus}:${selectedMonth}:${selectedSource}`}
          action="/app"
          className="flex flex-wrap items-end gap-3"
        >
          {selectedStatus !== DEFAULT_QUEUE_STATUS_FILTER ? (
            <input type="hidden" name="status" value={selectedStatus} />
          ) : null}

          <label className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Month
            </span>
            <select
              name="month"
              defaultValue={selectedMonth}
              className="min-w-48 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-white/25"
            >
              <option value={ALL_QUEUE_MONTH_FILTER}>All months</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month === UNDATED_QUEUE_MONTH_FILTER
                    ? "Undated"
                    : formatIsoMonthLabel(month)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Source
            </span>
            <select
              name="source"
              defaultValue={selectedSource}
              className="min-w-48 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-white/25"
            >
              <option value={ALL_QUEUE_SOURCE_FILTER}>All sources</option>
              {availableSources.map((source) => (
                <option key={source} value={source}>
                  {getBandcampDomainLabel(source)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
            >
              Apply filters
            </button>
            {hasActiveSecondaryFilters ? (
              <Link
                href={getQueueHref({ status: selectedStatus })}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <p>
          Showing {queueItems.length} of {queueResult.totalCount} {resultLabel}.
        </p>
        {queueResult.totalPages > 1 ? (
          <p>
            Page {queueResult.currentPage} of {queueResult.totalPages}
          </p>
        ) : null}
      </div>

      {queueItems.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-6">
          <p className="text-sm leading-7 text-zinc-400">No {emptyStateLabel} found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queueItems.map((item) => {
            const releaseTitle = item.releaseTitle ?? item.canonicalUrl;
            const artistName = item.artistName ?? item.bandcampDomain;
            const bandcampLabel = getBandcampDomainLabel(item.bandcampDomain);
            const bandcampProfileUrl = `https://${item.bandcampDomain}`;
            const originalEmailDateLabel = item.originalEmailSentOn
              ? formatIsoDateLabel(item.originalEmailSentOn)
              : null;

            return (
              <article
                key={item.userReleaseId}
                className="w-full max-w-[700px] rounded-[1.75rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    {originalEmailDateLabel ? (
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-600">
                        {originalEmailDateLabel}
                      </p>
                    ) : null}
                    {item.embedUrl ? null : (
                      <h2 className="text-lg font-semibold leading-snug tracking-tight text-white md:text-xl">
                        {releaseTitle}
                      </h2>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-zinc-500">
                      <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        {item.releaseType}
                      </span>
                      <span aria-hidden="true" className="text-zinc-700">
                        •
                      </span>
                      <a
                        href={bandcampProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 transition hover:text-zinc-200"
                        aria-label={`${bandcampLabel} Bandcamp page`}
                      >
                        {bandcampLabel}
                      </a>
                    </div>
                  </div>

                  <QueueItemStatusBadge
                    userReleaseId={item.userReleaseId}
                    currentStatus={item.status}
                    releaseTitle={releaseTitle}
                    artistName={artistName}
                    diagnostics={{
                      canonicalUrl: item.canonicalUrl,
                      bandcampDomain: item.bandcampDomain,
                      releaseType: item.releaseType,
                      importCount: item.importCount,
                      firstSeenAt: item.firstSeenAt.toISOString(),
                      lastSeenAt: item.lastSeenAt.toISOString(),
                      originalEmailSentOn: item.originalEmailSentOn,
                      resolvedStatus: item.resolvedStatus,
                      hasEmbed: Boolean(item.embedUrl),
                    }}
                  />
                </div>

                {item.embedUrl ? (
                  <div className="mt-3">
                    <BandcampEmbedPlayer src={item.embedUrl} title={releaseTitle} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
                    Player unavailable. Open the status menu for details and retry
                    options.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {queueResult.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
          {queueResult.currentPage > 1 ? (
            <Link
              href={getQueueHref({
                status: selectedStatus,
                month: selectedMonth,
                source: selectedSource,
                page: queueResult.currentPage - 1,
              })}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-600">
              Previous
            </span>
          )}

          <span className="text-sm text-zinc-400">
            {queueResult.currentPage} / {queueResult.totalPages}
          </span>

          {queueResult.currentPage < queueResult.totalPages ? (
            <Link
              href={getQueueHref({
                status: selectedStatus,
                month: selectedMonth,
                source: selectedSource,
                page: queueResult.currentPage + 1,
              })}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-600">
              Next
            </span>
          )}
        </div>
      ) : null}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { BandcampEmbedPlayer } from "@/components/bandcamp-embed-player";
import { QueueItemStatusBadge } from "@/components/queue-item-status-badge";
import { getBandcampDomainLabel } from "@/lib/bandcamp/get-bandcamp-domain-label";
import { formatIsoDateLabel } from "@/lib/dates/format-iso-date-label";
import {
  buildQueueSearchParams,
  DOUBLE_QUEUE_LAYOUT,
  type QueueLayout,
  type QueueMonthFilter,
  type QueueSourceFilter,
} from "@/lib/releases/queue-filters";
import type {
  QueueStatusFilter,
  UserReleaseStatus,
} from "@/lib/releases/user-release-status";
import { cn } from "@/lib/utils";

type QueuePlaybackItem = {
  userReleaseId: string;
  status: UserReleaseStatus;
  canonicalUrl: string;
  bandcampDomain: string;
  artistName: string | null;
  releaseTitle: string | null;
  releaseType: string;
  importCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  originalEmailSentOn: string | null;
  resolvedStatus: string;
  embedUrl: string | null;
};

type QueuePlaybackListProps = {
  items: QueuePlaybackItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  resultLabel: string;
  emptyStateLabel: string;
  selectedStatus: QueueStatusFilter;
  selectedMonth: QueueMonthFilter;
  selectedSource: QueueSourceFilter;
  selectedLayout: QueueLayout;
};

function getQueuePageHref(input: {
  status: QueueStatusFilter;
  month: QueueMonthFilter;
  source: QueueSourceFilter;
  layout: QueueLayout;
  page: number;
}) {
  const query = buildQueueSearchParams(input).toString();
  return query ? `/app?${query}` : "/app";
}

export function QueuePlaybackList({
  items,
  totalCount,
  totalPages,
  currentPage,
  resultLabel,
  emptyStateLabel,
  selectedStatus,
  selectedMonth,
  selectedSource,
  selectedLayout,
}: QueuePlaybackListProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const articleRefs = useRef<Record<string, HTMLElement | null>>({});
  const activeItem = useMemo(
    () => items.find((item) => item.userReleaseId === activeItemId) ?? null,
    [activeItemId, items],
  );

  function scrollToActiveItem() {
    if (!activeItem) {
      return;
    }

    articleRefs.current[activeItem.userReleaseId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <div className={cn("space-y-4", activeItem ? "pb-80 md:pb-72" : undefined)}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <p>
          Showing {items.length} of {totalCount} {resultLabel}.
        </p>
        {totalPages > 1 ? (
          <p>
            Page {currentPage} of {totalPages}
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-6">
          <p className="text-sm leading-7 text-zinc-400">No {emptyStateLabel} found.</p>
        </div>
      ) : (
        <div
          className={
            selectedLayout === DOUBLE_QUEUE_LAYOUT
              ? "grid grid-cols-1 gap-3 lg:grid-cols-2"
              : "grid grid-cols-1 gap-3"
          }
        >
          {items.map((item) => {
            const releaseTitle = item.releaseTitle ?? item.canonicalUrl;
            const artistName = item.artistName ?? item.bandcampDomain;
            const bandcampLabel = getBandcampDomainLabel(item.bandcampDomain);
            const bandcampProfileUrl = `https://${item.bandcampDomain}`;
            const originalEmailDateLabel = item.originalEmailSentOn
              ? formatIsoDateLabel(item.originalEmailSentOn)
              : null;
            const isActive = item.userReleaseId === activeItem?.userReleaseId;

            return (
              <article
                key={item.userReleaseId}
                ref={(element) => {
                  articleRefs.current[item.userReleaseId] = element;
                }}
                className={cn(
                  "scroll-mb-[18rem] rounded-[1.75rem] border border-white/10 bg-black/20 p-4 md:scroll-mb-[14rem]",
                  selectedLayout === DOUBLE_QUEUE_LAYOUT
                    ? "h-full w-full"
                    : "w-full max-w-[700px]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    {originalEmailDateLabel ? (
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-600">
                        {originalEmailDateLabel}
                      </p>
                    ) : null}
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold leading-snug tracking-tight text-white md:text-xl">
                        {releaseTitle}
                      </h2>
                      <p className="text-sm text-zinc-400">{artistName}</p>
                    </div>
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
                      firstSeenAt: item.firstSeenAt,
                      lastSeenAt: item.lastSeenAt,
                      originalEmailSentOn: item.originalEmailSentOn,
                      resolvedStatus: item.resolvedStatus,
                      hasEmbed: Boolean(item.embedUrl),
                    }}
                  />
                </div>

                {item.embedUrl ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveItemId(item.userReleaseId)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        isActive
                          ? "border-sky-400/40 bg-sky-400/10 text-sky-100"
                          : "border-white/15 text-zinc-100 hover:border-white/30",
                      )}
                    >
                      {isActive ? "Playing in dock" : "Play in dock"}
                    </button>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
                    >
                      Open release
                    </a>
                    <p className="text-sm text-zinc-500">
                      Keeps the player pinned while you browse the queue.
                    </p>
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

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
          {currentPage > 1 ? (
            <Link
              href={getQueuePageHref({
                status: selectedStatus,
                month: selectedMonth,
                source: selectedSource,
                layout: selectedLayout,
                page: currentPage - 1,
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
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={getQueuePageHref({
                status: selectedStatus,
                month: selectedMonth,
                source: selectedSource,
                layout: selectedLayout,
                page: currentPage + 1,
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

      {activeItem?.embedUrl ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Now playing
              </p>
              <div className="mt-2 min-w-0">
                <p className="truncate text-base font-semibold text-white">
                  {activeItem.releaseTitle ?? activeItem.canonicalUrl}
                </p>
                <p className="truncate text-sm text-zinc-400">
                  {activeItem.artistName ?? activeItem.bandcampDomain}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={scrollToActiveItem}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
                >
                  View queue card
                </button>
                <a
                  href={activeItem.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
                >
                  Open release
                </a>
                <button
                  type="button"
                  onClick={() => setActiveItemId(null)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="w-full max-w-2xl">
              <BandcampEmbedPlayer
                src={activeItem.embedUrl}
                title={activeItem.releaseTitle ?? activeItem.canonicalUrl}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

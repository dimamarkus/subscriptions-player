"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BandcampEmbedPlayer } from "@/components/bandcamp-embed-player";
import { QueueItemStatusBadge } from "@/components/queue-item-status-badge";
import { UserReleaseStatusQuickActions } from "@/components/user-release-status-quick-actions";
import { formatIsoDateLabel } from "@/lib/dates/format-iso-date-label";
import { formatReleaseDisplay } from "@/lib/releases/format-release-display";
import {
  buildQueueSearchParams,
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
  coverImageUrl: string | null;
  importCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  originalEmailSentOn: string | null;
  resolvedStatus: string;
  embedUrl: string | null;
};

type ActivePlaybackItem = QueuePlaybackItem & {
  displayTitle: string;
  detailsArtistName: string;
  bandcampLabel: string;
};

type QueuePlaybackListProps = {
  items: QueuePlaybackItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  resultLabel: string;
  emptyStateLabel: string;
  selectedQuery: string;
  selectedStatus: QueueStatusFilter;
  selectedMonth: QueueMonthFilter;
  selectedSource: QueueSourceFilter;
};

function getQueuePageHref(input: {
  query: string;
  status: QueueStatusFilter;
  month: QueueMonthFilter;
  source: QueueSourceFilter;
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
  selectedQuery,
  selectedStatus,
  selectedMonth,
  selectedSource,
}: QueuePlaybackListProps) {
  const [activeItem, setActiveItem] = useState<ActivePlaybackItem | null>(null);
  const [hoveredArtItemId, setHoveredArtItemId] = useState<string | null>(null);
  const activeDisplay = useMemo(
    () =>
      activeItem
        ? {
            displayTitle: activeItem.displayTitle,
            detailsArtistName: activeItem.detailsArtistName,
            bandcampLabel: activeItem.bandcampLabel,
          }
        : null,
    [activeItem],
  );

  return (
    <div className={cn("space-y-4", activeItem ? "pb-80 md:pb-72" : undefined)}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <div className="space-y-1">
          <p>
            Showing {items.length} of {totalCount} {resultLabel}.
          </p>
          {selectedQuery ? (
            <p className="text-xs text-zinc-500">
              Searching titles, artists, and links for{" "}
              <span className="font-medium text-zinc-300">{selectedQuery}</span>.
            </p>
          ) : null}
        </div>
        {totalPages > 1 ? (
          <p>
            Page {currentPage} of {totalPages}
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-6">
          <p className="text-sm leading-7 text-zinc-400">
            {selectedQuery
              ? `No ${emptyStateLabel} match `
              : `No ${emptyStateLabel} found.`}
            {selectedQuery ? (
              <span className="font-medium text-zinc-300">{selectedQuery}</span>
            ) : null}
            {selectedQuery ? "." : null}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {items.map((item) => {
            const { bandcampLabel, detailsArtistName, displayTitle } =
              formatReleaseDisplay({
                releaseTitle: item.releaseTitle,
                artistName: item.artistName,
                canonicalUrl: item.canonicalUrl,
                bandcampDomain: item.bandcampDomain,
              });
            const originalEmailDateLabel = item.originalEmailSentOn
              ? formatIsoDateLabel(item.originalEmailSentOn)
              : null;
            const isActive = item.userReleaseId === activeItem?.userReleaseId;
            const isArtHovered = hoveredArtItemId === item.userReleaseId;
            const canPlay = Boolean(item.embedUrl);
            const artLabel = canPlay
              ? `Play ${displayTitle} in dock`
              : `${displayTitle} artwork unavailable for playback`;

            return (
              <article
                key={item.userReleaseId}
                className={cn(
                  "scroll-mb-[18rem] rounded-[1.75rem] border border-white/10 bg-black/20 p-4 transition md:scroll-mb-[14rem]",
                  "h-full w-full",
                  item.status !== "new" && !isActive ? "opacity-75" : undefined,
                  isActive
                    ? "border-sky-400/30 bg-linear-to-br from-sky-400/[0.12] via-sky-500/[0.05] to-black/40 shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_18px_50px_rgba(8,47,73,0.22)]"
                    : undefined,
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canPlay) {
                        return;
                      }

                      setActiveItem({
                        ...item,
                        displayTitle,
                        detailsArtistName,
                        bandcampLabel,
                      });
                    }}
                    onPointerEnter={() => {
                      if (canPlay) {
                        setHoveredArtItemId(item.userReleaseId);
                      }
                    }}
                    onPointerLeave={() => {
                      setHoveredArtItemId((currentValue) =>
                        currentValue === item.userReleaseId ? null : currentValue,
                      );
                    }}
                    onFocus={() => {
                      if (canPlay) {
                        setHoveredArtItemId(item.userReleaseId);
                      }
                    }}
                    onBlur={() => {
                      setHoveredArtItemId((currentValue) =>
                        currentValue === item.userReleaseId ? null : currentValue,
                      );
                    }}
                    disabled={!canPlay}
                    aria-label={artLabel}
                    className={cn(
                      "group relative size-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-default disabled:opacity-70 sm:size-24",
                      canPlay
                        ? "cursor-pointer hover:border-white/25"
                        : "cursor-default",
                      isActive
                        ? "border-sky-400/30 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]"
                        : undefined,
                    )}
                  >
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={`${displayTitle} cover art`}
                        fill
                        sizes="(min-width: 1024px) 96px, 80px"
                        className={cn(
                          "object-cover transition duration-200",
                          isArtHovered
                            ? "scale-[1.03] brightness-75"
                            : undefined,
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "absolute inset-0 bg-linear-to-br from-zinc-800 to-zinc-900 transition duration-200",
                          isArtHovered
                            ? "brightness-75"
                            : undefined,
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition duration-200",
                        isArtHovered
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    >
                      <span className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-black/40">
                        <span
                          aria-hidden="true"
                          className="ml-0.5 text-sm leading-none"
                        >
                          ▶
                        </span>
                      </span>
                    </div>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {originalEmailDateLabel ? (
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-600">
                              {originalEmailDateLabel}
                            </p>
                          ) : null}
                          {isActive ? (
                            <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100">
                              Now playing
                            </span>
                          ) : null}
                        </div>
                        <h2 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                          {displayTitle}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                          <span>{item.releaseType}</span>
                          <span aria-hidden="true" className="text-zinc-700">
                            •
                          </span>
                          <span>{bandcampLabel}</span>
                        </div>
                      </div>

                      <QueueItemStatusBadge
                        userReleaseId={item.userReleaseId}
                        currentStatus={item.status}
                        releaseTitle={displayTitle}
                        artistName={detailsArtistName}
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
                  </div>
                </div>

                {!item.embedUrl ? (
                  <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
                    Player unavailable. Open the status menu for details and retry
                    options.
                  </div>
                ) : (
                  <div className="sr-only" aria-live="polite">
                    {isActive ? `${displayTitle} is now playing in the dock.` : null}
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
                query: selectedQuery,
                status: selectedStatus,
                month: selectedMonth,
                source: selectedSource,
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
                query: selectedQuery,
                status: selectedStatus,
                month: selectedMonth,
                source: selectedSource,
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

      {activeItem?.embedUrl && activeDisplay ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-400/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(9,12,22,0.98))] shadow-[0_-18px_60px_rgba(2,6,23,0.5)] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 pr-10">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                aria-label="Close now playing"
                className="absolute right-0 top-0 inline-flex size-7 items-center justify-center rounded-full border border-white/10 text-sm text-zinc-400 transition hover:border-white/25 hover:text-white"
              >
                ×
              </button>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/65">
                Now playing
              </p>
              <div className="mt-2 min-w-0">
                <p className="truncate text-base font-semibold text-white">
                  {activeDisplay.displayTitle}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                  <span>{activeItem.releaseType}</span>
                  <span aria-hidden="true" className="text-zinc-700">
                    •
                  </span>
                  <a
                    href={`https://${activeItem.bandcampDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-white"
                  >
                    {activeDisplay.bandcampLabel}
                  </a>
                </div>
              </div>
              <div className="mt-4">
                <UserReleaseStatusQuickActions
                  userReleaseId={activeItem.userReleaseId}
                  currentStatus={activeItem.status}
                  onStatusChange={(status) => {
                    setActiveItem((currentValue) =>
                      currentValue
                        ? {
                            ...currentValue,
                            status,
                          }
                        : currentValue,
                    );
                  }}
                />
              </div>
            </div>

            <div className="w-full max-w-2xl">
              <BandcampEmbedPlayer
                src={activeItem.embedUrl}
                title={activeDisplay.displayTitle}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

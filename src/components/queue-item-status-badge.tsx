"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { enrichReleaseAction } from "@/actions/releases";
import { updateUserReleaseStatusAction } from "@/actions/user-releases";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatIsoDateLabel } from "@/lib/dates/format-iso-date-label";
import {
  USER_RELEASE_STATUS_ACTION_OPTIONS,
  USER_RELEASE_STATUS_BADGE_CLASS_NAMES,
} from "@/lib/releases/user-release-status-ui";
import type { UserReleaseStatus } from "@/lib/releases/user-release-status";
import { cn } from "@/lib/utils";

type QueueItemStatusBadgeProps = {
  userReleaseId: string;
  currentStatus: UserReleaseStatus;
  releaseTitle: string;
  artistName: string;
  diagnostics: {
    canonicalUrl: string;
    bandcampDomain: string;
    releaseType: string;
    importCount: number;
    firstSeenAt: string;
    lastSeenAt: string;
    originalEmailSentOn: string | null;
    resolvedStatus: string;
    hasEmbed: boolean;
  };
};

export function QueueItemStatusBadge({
  userReleaseId,
  currentStatus,
  releaseTitle,
  artistName,
  diagnostics,
}: QueueItemStatusBadgeProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formattedDates = useMemo(
    () => ({
      firstSeenAt: new Date(diagnostics.firstSeenAt).toLocaleString(),
      lastSeenAt: new Date(diagnostics.lastSeenAt).toLocaleString(),
      originalEmailSentOn: diagnostics.originalEmailSentOn
        ? formatIsoDateLabel(diagnostics.originalEmailSentOn)
        : null,
    }),
    [
      diagnostics.firstSeenAt,
      diagnostics.lastSeenAt,
      diagnostics.originalEmailSentOn,
    ],
  );

  function updateStatus(status: UserReleaseStatus) {
    startTransition(async () => {
      await updateUserReleaseStatusAction(userReleaseId, status);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-white/30 disabled:cursor-wait disabled:opacity-60",
              USER_RELEASE_STATUS_BADGE_CLASS_NAMES[currentStatus],
            )}
            disabled={isPending}
          >
            <span>{isPending ? "updating" : currentStatus}</span>
            <span aria-hidden="true" className="text-[10px] text-current/80">
              v
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {USER_RELEASE_STATUS_ACTION_OPTIONS.map((option) => {
            return (
              <DropdownMenuItem
                key={option.status}
                disabled={isPending}
                onSelect={() => updateStatus(option.status)}
                className="flex items-center justify-between gap-4"
              >
                <span>{option.label}</span>
                {currentStatus === option.status ? (
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Current
                  </span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setDetailsOpen(true);
            }}
          >
            View details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{releaseTitle}</DialogTitle>
            <DialogDescription>{artistName}</DialogDescription>
          </DialogHeader>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Queue status</dt>
              <dd className="mt-1 text-zinc-100">{currentStatus}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Import status</dt>
              <dd className="mt-1 text-zinc-100">{diagnostics.resolvedStatus}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Release type</dt>
              <dd className="mt-1 text-zinc-100">{diagnostics.releaseType}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Imports</dt>
              <dd className="mt-1 text-zinc-100">{diagnostics.importCount}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">First seen</dt>
              <dd className="mt-1 text-zinc-100">{formattedDates.firstSeenAt}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Last seen</dt>
              <dd className="mt-1 text-zinc-100">{formattedDates.lastSeenAt}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Original email date</dt>
              <dd className="mt-1 text-zinc-100">
                {formattedDates.originalEmailSentOn ?? "Unavailable"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Bandcamp domain</dt>
              <dd className="mt-1 break-all text-zinc-100">
                {diagnostics.bandcampDomain}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Canonical URL</dt>
              <dd className="mt-1 break-all text-zinc-100">
                {diagnostics.canonicalUrl}
              </dd>
            </div>
          </dl>

          {!diagnostics.hasEmbed ? (
            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
              Player metadata is missing for this release. Retry enrichment to fetch
              a Bandcamp embed again.
            </div>
          ) : null}

          <DialogFooter>
            {!diagnostics.hasEmbed ? (
              <form action={enrichReleaseAction.bind(null, userReleaseId)}>
                <button
                  type="submit"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
                >
                  Retry metadata and player
                </button>
              </form>
            ) : null}
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
              >
                Close
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

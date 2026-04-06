"use client";

import { useMemo, useState } from "react";

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
import { cn } from "@/lib/utils";

type UserReleaseStatus = "new" | "listened" | "saved" | "skipped" | "archived";

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
    resolvedStatus: string;
    hasEmbed: boolean;
  };
};

const STATUS_OPTIONS: Array<{
  label: string;
  status: UserReleaseStatus;
}> = [
  { label: "New", status: "new" },
  { label: "Listened", status: "listened" },
  { label: "Save", status: "saved" },
  { label: "Skip", status: "skipped" },
  { label: "Archive", status: "archived" },
];

const STATUS_BADGE_CLASS_NAMES: Record<UserReleaseStatus, string> = {
  new: "border-white/15 bg-white/5 text-zinc-200",
  listened: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  saved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  skipped: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  archived: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
};

export function QueueItemStatusBadge({
  userReleaseId,
  currentStatus,
  releaseTitle,
  artistName,
  diagnostics,
}: QueueItemStatusBadgeProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const formattedDates = useMemo(
    () => ({
      firstSeenAt: new Date(diagnostics.firstSeenAt).toLocaleString(),
      lastSeenAt: new Date(diagnostics.lastSeenAt).toLocaleString(),
    }),
    [diagnostics.firstSeenAt, diagnostics.lastSeenAt],
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-white/30",
              STATUS_BADGE_CLASS_NAMES[currentStatus],
            )}
          >
            <span>{currentStatus}</span>
            <span aria-hidden="true" className="text-[10px] text-current/80">
              v
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {STATUS_OPTIONS.map((option) => {
            const formAction = updateUserReleaseStatusAction.bind(
              null,
              userReleaseId,
              option.status,
            );

            return (
              <form key={option.status} action={formAction}>
                <DropdownMenuItem asChild>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span>{option.label}</span>
                    {currentStatus === option.status ? (
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Current
                      </span>
                    ) : null}
                  </button>
                </DropdownMenuItem>
              </form>
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

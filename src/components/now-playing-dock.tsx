"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateUserReleaseRatingAction } from "@/actions/user-releases";
import { BandcampEmbedPlayer } from "@/components/bandcamp-embed-player";
import { useNowPlaying } from "@/components/now-playing-provider";
import { StarRating } from "@/components/star-rating";
import { UserReleaseStatusQuickActions } from "@/components/user-release-status-quick-actions";
import {
  assertUserReleaseRatingHalfSteps,
  type UserReleaseRatingHalfSteps,
} from "@/lib/releases/user-release-rating";

export function NowPlayingDock() {
  const router = useRouter();
  const { activeItem, closeItem, updateActiveItemStatus, updateActiveItemRating } =
    useNowPlaying();
  const [isRatingPending, startRatingTransition] = useTransition();

  if (!activeItem?.embedUrl) {
    return null;
  }

  function handleRatingChange(
    ratingHalfSteps: UserReleaseRatingHalfSteps | null,
  ) {
    if (!activeItem) {
      return;
    }

    const userReleaseId = activeItem.userReleaseId;

    startRatingTransition(async () => {
      await updateUserReleaseRatingAction(userReleaseId, ratingHalfSteps);
      updateActiveItemRating(ratingHalfSteps);
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-400/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(9,12,22,0.98))] shadow-[0_-18px_60px_rgba(2,6,23,0.5)] backdrop-blur-xl">
      <button
        type="button"
        onClick={closeItem}
        aria-label="Close now playing"
        className="absolute top-3 right-3 z-10 inline-flex size-7 items-center justify-center rounded-full border border-white/10 text-sm text-zinc-400 transition hover:border-white/25 hover:text-white sm:top-4 sm:right-4"
      >
        ×
      </button>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 pr-12 sm:px-6 sm:pr-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-white">
                {activeItem.displayTitle}
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
                  {activeItem.bandcampLabel}
                </a>
              </div>
            </div>
            <StarRating
              value={activeItem.ratingHalfSteps}
              ariaLabel={`Rate ${activeItem.displayTitle}`}
              disabled={isRatingPending}
              size={20}
              className="shrink-0 pt-0.5"
              onChange={(ratingHalfSteps) =>
                handleRatingChange(
                  ratingHalfSteps === null
                    ? null
                    : assertUserReleaseRatingHalfSteps(ratingHalfSteps),
                )
              }
            />
          </div>
          <div className="mt-4">
            <UserReleaseStatusQuickActions
              userReleaseId={activeItem.userReleaseId}
              currentStatus={activeItem.status}
              onStatusChange={updateActiveItemStatus}
            />
          </div>
        </div>

        <div className="w-full max-w-2xl">
          <BandcampEmbedPlayer
            src={activeItem.embedUrl}
            title={activeItem.displayTitle}
          />
        </div>
      </div>
    </div>
  );
}

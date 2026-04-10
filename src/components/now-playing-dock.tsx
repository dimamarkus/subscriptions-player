"use client";

import { BandcampEmbedPlayer } from "@/components/bandcamp-embed-player";
import { UserReleaseStatusQuickActions } from "@/components/user-release-status-quick-actions";
import { useNowPlaying } from "@/components/now-playing-provider";

export function NowPlayingDock() {
  const { activeItem, closeItem, updateActiveItemStatus } = useNowPlaying();

  if (!activeItem?.embedUrl) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-400/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(9,12,22,0.98))] shadow-[0_-18px_60px_rgba(2,6,23,0.5)] backdrop-blur-xl">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 pr-12 sm:px-6 sm:pr-14 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={closeItem}
          aria-label="Close now playing"
          className="absolute right-4 top-4 inline-flex size-7 items-center justify-center rounded-full border border-white/10 text-sm text-zinc-400 transition hover:border-white/25 hover:text-white sm:right-6"
        >
          ×
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/65">
            Now playing
          </p>
          <div className="mt-2 min-w-0">
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

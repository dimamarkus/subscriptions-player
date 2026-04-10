"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { UserReleaseStatus } from "@/lib/releases/user-release-status";

export type NowPlayingItem = {
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
  displayTitle: string;
  detailsArtistName: string;
  bandcampLabel: string;
};

type NowPlayingContextValue = {
  activeItem: NowPlayingItem | null;
  playItem: (item: NowPlayingItem) => void;
  closeItem: () => void;
  updateActiveItemStatus: (status: UserReleaseStatus) => void;
};

const NowPlayingContext = createContext<NowPlayingContextValue | null>(null);

type NowPlayingProviderProps = {
  children: React.ReactNode;
};

export function NowPlayingProvider({ children }: NowPlayingProviderProps) {
  const [activeItem, setActiveItem] = useState<NowPlayingItem | null>(null);

  const value = useMemo<NowPlayingContextValue>(
    () => ({
      activeItem,
      playItem: (item) => setActiveItem(item),
      closeItem: () => setActiveItem(null),
      updateActiveItemStatus: (status) =>
        setActiveItem((currentValue) =>
          currentValue
            ? {
                ...currentValue,
                status,
              }
            : currentValue,
        ),
    }),
    [activeItem],
  );

  return <NowPlayingContext.Provider value={value}>{children}</NowPlayingContext.Provider>;
}

export function useNowPlaying() {
  const context = useContext(NowPlayingContext);

  if (!context) {
    throw new Error("useNowPlaying must be used within a NowPlayingProvider.");
  }

  return context;
}

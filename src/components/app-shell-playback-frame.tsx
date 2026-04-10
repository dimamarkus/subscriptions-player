"use client";

import { NowPlayingDock } from "@/components/now-playing-dock";
import { NowPlayingProvider, useNowPlaying } from "@/components/now-playing-provider";
import { cn } from "@/lib/utils";

type AppShellPlaybackFrameProps = {
  children: React.ReactNode;
};

function AppShellPlaybackViewport({ children }: AppShellPlaybackFrameProps) {
  const { activeItem } = useNowPlaying();

  return (
    <>
      <main
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10",
          activeItem ? "pb-80 md:pb-72" : undefined,
        )}
      >
        {children}
      </main>
      <NowPlayingDock />
    </>
  );
}

export function AppShellPlaybackFrame({ children }: AppShellPlaybackFrameProps) {
  return (
    <NowPlayingProvider>
      <AppShellPlaybackViewport>{children}</AppShellPlaybackViewport>
    </NowPlayingProvider>
  );
}

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { AppShellPlaybackFrame } from "@/components/app-shell-playback-frame";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link
              href="/app"
              className="text-inherit text-sm font-semibold tracking-[0.24em]"
            >
              TraxHunter
            </Link>
            <p className="mt-1 text-sm text-zinc-400">
              Privacy-first Bandcamp email listening queue
            </p>
          </div>

          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link href="/app" className="text-inherit transition hover:text-white">
              Queue
            </Link>
            <Link
              href="/app/imports"
              className="text-inherit transition hover:text-white"
            >
              Imports
            </Link>
            <Link
              href="/app/settings"
              className="text-inherit transition hover:text-white"
            >
              Settings
            </Link>
            <UserButton />
          </nav>
        </div>
      </header>

      <AppShellPlaybackFrame>{children}</AppShellPlaybackFrame>
    </div>
  );
}

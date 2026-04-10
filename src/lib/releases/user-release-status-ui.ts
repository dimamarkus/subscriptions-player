import type { UserReleaseStatus } from "@/lib/releases/user-release-status";

export const USER_RELEASE_STATUS_ACTION_OPTIONS: Array<{
  label: string;
  status: UserReleaseStatus;
}> = [
  { label: "New", status: "new" },
  { label: "Listened", status: "listened" },
  { label: "Save", status: "saved" },
  { label: "Skip", status: "skipped" },
  { label: "Archive", status: "archived" },
];

export const USER_RELEASE_STATUS_BADGE_CLASS_NAMES: Record<UserReleaseStatus, string> = {
  new: "border-white/15 bg-white/5 text-zinc-200",
  listened: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  saved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  skipped: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  archived: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
};

export const USER_RELEASE_STATUS_QUICK_OPTIONS: Array<{
  label: string;
  status: Exclude<UserReleaseStatus, "new">;
}> = [
  { label: "Listened", status: "listened" },
  { label: "Saved", status: "saved" },
  { label: "Skipped", status: "skipped" },
  { label: "Archived", status: "archived" },
];

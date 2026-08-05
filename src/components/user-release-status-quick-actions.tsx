"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateUserReleaseStatusAction } from "@/actions/user-releases";
import { USER_RELEASE_STATUS_BADGE_CLASS_NAMES } from "@/lib/releases/user-release-status-ui";
import type { UserReleaseStatus } from "@/lib/releases/user-release-status";
import { cn } from "@/lib/utils";

type UserReleaseStatusQuickActionsProps = {
  userReleaseId: string;
  currentStatus: UserReleaseStatus;
  onStatusChange?: (status: Exclude<UserReleaseStatus, "new">) => void;
};

type StatusQuickIconProps = {
  className?: string;
};

function ListenIcon({ className }: StatusQuickIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function SaveIcon({ className }: StatusQuickIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BoughtIcon({ className }: StatusQuickIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function SkipIcon({ className }: StatusQuickIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 4l10 8-10 8V4z" />
      <path d="M19 5v14" />
    </svg>
  );
}

function ArchiveIcon({ className }: StatusQuickIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

const STATUS_QUICK_ACTIONS = [
  {
    status: "listened",
    label: "Listened",
    shortLabel: "Listen",
    Icon: ListenIcon,
  },
  {
    status: "skipped",
    label: "Skipped",
    shortLabel: "Skip",
    Icon: SkipIcon,
  },
  {
    status: "saved",
    label: "Saved",
    shortLabel: "Save",
    Icon: SaveIcon,
  },
  {
    status: "purchased",
    label: "Bought",
    shortLabel: "Bought",
    Icon: BoughtIcon,
  },
  {
    status: "archived",
    label: "Archived",
    shortLabel: "Archive",
    Icon: ArchiveIcon,
  },
] as const;

export function UserReleaseStatusQuickActions({
  userReleaseId,
  currentStatus,
  onStatusChange,
}: UserReleaseStatusQuickActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: Exclude<UserReleaseStatus, "new">) {
    startTransition(async () => {
      await updateUserReleaseStatusAction(userReleaseId, status);
      onStatusChange?.(status);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Release status"
      className="grid grid-cols-5 overflow-hidden rounded-2xl border border-white/12 bg-white/3"
    >
      {STATUS_QUICK_ACTIONS.map((option, index) => {
        const isActive = currentStatus === option.status;
        const Icon = option.Icon;
        // Visual split after Skip: left = playback outcome, right = keep/clear.
        const startsKeepGroup = index === 2;

        return (
          <button
            key={option.status}
            type="button"
            onClick={() => updateStatus(option.status)}
            disabled={isPending}
            aria-pressed={isActive}
            aria-label={option.label}
            title={option.label}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition disabled:cursor-wait disabled:opacity-60",
              "border-r border-white/10 last:border-r-0",
              startsKeepGroup && "border-l border-l-white/25",
              isActive
                ? USER_RELEASE_STATUS_BADGE_CLASS_NAMES[option.status]
                : "text-zinc-300 hover:bg-white/4 hover:text-white",
            )}
          >
            <Icon className="size-3.5 shrink-0 sm:size-4" />
            <span className="truncate">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

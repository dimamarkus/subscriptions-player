"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateUserReleaseStatusAction } from "@/actions/user-releases";
import {
  USER_RELEASE_STATUS_BADGE_CLASS_NAMES,
  USER_RELEASE_STATUS_QUICK_OPTIONS,
} from "@/lib/releases/user-release-status-ui";
import type { UserReleaseStatus } from "@/lib/releases/user-release-status";
import { cn } from "@/lib/utils";

type UserReleaseStatusQuickActionsProps = {
  userReleaseId: string;
  currentStatus: UserReleaseStatus;
  onStatusChange?: (status: Exclude<UserReleaseStatus, "new">) => void;
};

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
    <div className="flex flex-wrap items-center gap-2">
      {USER_RELEASE_STATUS_QUICK_OPTIONS.map((option) => {
        const isActive = currentStatus === option.status;

        return (
          <button
            key={option.status}
            type="button"
            onClick={() => updateStatus(option.status)}
            disabled={isPending}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition disabled:cursor-wait disabled:opacity-60",
              isActive
                ? USER_RELEASE_STATUS_BADGE_CLASS_NAMES[option.status]
                : "border-white/12 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

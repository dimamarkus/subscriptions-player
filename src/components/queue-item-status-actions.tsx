import { updateUserReleaseStatusAction } from "@/actions/user-releases";

type QueueItemStatusActionsProps = {
  userReleaseId: string;
};

const STATUS_ACTIONS = [
  { label: "Listened", status: "listened" },
  { label: "Save", status: "saved" },
  { label: "Skip", status: "skipped" },
  { label: "Archive", status: "archived" },
] as const;

export function QueueItemStatusActions({
  userReleaseId,
}: QueueItemStatusActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {STATUS_ACTIONS.map((action) => {
        const formAction = updateUserReleaseStatusAction.bind(
          null,
          userReleaseId,
          action.status,
        );

        return (
          <form key={action.status} action={formAction}>
            <button
              type="submit"
              className="rounded-full border border-white/15 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-200 transition hover:border-white/30"
            >
              {action.label}
            </button>
          </form>
        );
      })}
    </div>
  );
}

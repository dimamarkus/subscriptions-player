import { redirect } from "next/navigation";

import { QueueFilters } from "@/components/queue-filters";
import { QueuePlaybackList } from "@/components/queue-playback-list";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { getActiveInboundAlias } from "@/lib/inbound-aliases/get-active-inbound-alias";
import { listUserQueueItems } from "@/lib/releases/list-user-queue-items";
import {
  parseQueueFilters,
} from "@/lib/releases/queue-filters";
import {
  ALL_QUEUE_STATUS_FILTER,
} from "@/lib/releases/user-release-status";

const QUEUE_PAGE_SIZE = 24;

type AppHomePageProps = {
  searchParams: Promise<{
    page?: string | string[];
    status?: string | string[];
    month?: string | string[];
    source?: string | string[];
  }>;
};
export default async function AppHomePage({ searchParams }: AppHomePageProps) {
  const params = await searchParams;
  const currentUser = await ensureAppUser();
  const inboundAlias = await getActiveInboundAlias(currentUser.id);

  if (!inboundAlias) {
    redirect("/app/settings");
  }

  const {
    status: selectedStatus,
    month: selectedMonth,
    source: selectedSource,
    page: requestedPage,
  } = parseQueueFilters(params);
  const queueResult = await listUserQueueItems({
    userId: currentUser.id,
    status: selectedStatus,
    month: selectedMonth,
    source: selectedSource,
    page: requestedPage,
    pageSize: QUEUE_PAGE_SIZE,
  });
  const queueItems = queueResult.items;
  const resultLabel =
    selectedStatus === ALL_QUEUE_STATUS_FILTER ? "all releases" : `${selectedStatus} releases`;
  const emptyStateLabel =
    selectedStatus === ALL_QUEUE_STATUS_FILTER ? "releases" : `${selectedStatus} releases`;
  const playbackItems = queueItems.map((item) => ({
    userReleaseId: item.userReleaseId,
    status: item.status,
    canonicalUrl: item.canonicalUrl,
    bandcampDomain: item.bandcampDomain,
    artistName: item.artistName,
    releaseTitle: item.releaseTitle,
    releaseType: item.releaseType,
    coverImageUrl: item.coverImageUrl,
    importCount: item.importCount,
    firstSeenAt: item.firstSeenAt.toISOString(),
    lastSeenAt: item.lastSeenAt.toISOString(),
    originalEmailSentOn: item.originalEmailSentOn,
    resolvedStatus: item.resolvedStatus,
    embedUrl: item.embedUrl,
  }));

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Queue
        </p>
        <h1 className="text-3xl font-semibold text-white">Listening queue</h1>
      </div>

      <QueueFilters
        selectedStatus={selectedStatus}
        selectedMonth={selectedMonth}
        selectedSource={selectedSource}
        availableMonths={queueResult.availableMonths}
        availableSources={queueResult.availableSources}
      />
      <QueuePlaybackList
        items={playbackItems}
        totalCount={queueResult.totalCount}
        totalPages={queueResult.totalPages}
        currentPage={queueResult.currentPage}
        resultLabel={resultLabel}
        emptyStateLabel={emptyStateLabel}
        selectedStatus={selectedStatus}
        selectedMonth={selectedMonth}
        selectedSource={selectedSource}
      />
    </section>
  );
}

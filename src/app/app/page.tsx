import { redirect } from "next/navigation";

import { BandcampEmbedPlayer } from "@/components/bandcamp-embed-player";
import { QueueItemStatusBadge } from "@/components/queue-item-status-badge";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { getBandcampDomainLabel } from "@/lib/bandcamp/get-bandcamp-domain-label";
import { getActiveInboundAlias } from "@/lib/inbound-aliases/get-active-inbound-alias";
import { listUserQueueItems } from "@/lib/releases/list-user-queue-items";

export default async function AppHomePage() {
  const currentUser = await ensureAppUser();
  const inboundAlias = await getActiveInboundAlias(currentUser.id);

  if (!inboundAlias) {
    redirect("/app/onboarding");
  }

  const queueItems = await listUserQueueItems(currentUser.id);

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Queue
        </p>
        <h1 className="text-3xl font-semibold text-white">Listening queue</h1>
      </div>

      {queueItems.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-6">
          <p className="text-sm leading-7 text-zinc-400">
            No releases have been imported yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {queueItems.map((item) => {
            const releaseTitle = item.releaseTitle ?? item.canonicalUrl;
            const artistName = item.artistName ?? item.bandcampDomain;
            const bandcampLabel = getBandcampDomainLabel(item.bandcampDomain);
            const bandcampProfileUrl = `https://${item.bandcampDomain}`;

            return (
              <article
                key={item.userReleaseId}
                className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                      <span>{item.releaseType}</span>
                      <span aria-hidden="true" className="text-zinc-700">
                        •
                      </span>
                      <a
                        href={bandcampProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="tracking-[0.14em] text-zinc-400 transition hover:text-white"
                        aria-label={`${bandcampLabel} Bandcamp page`}
                      >
                        {bandcampLabel}
                      </a>
                    </div>
                    <h2 className="text-base font-semibold text-white md:text-lg">
                      {releaseTitle}
                    </h2>
                  </div>

                  <QueueItemStatusBadge
                    userReleaseId={item.userReleaseId}
                    currentStatus={item.status}
                    releaseTitle={releaseTitle}
                    artistName={artistName}
                    diagnostics={{
                      canonicalUrl: item.canonicalUrl,
                      bandcampDomain: item.bandcampDomain,
                      releaseType: item.releaseType,
                      importCount: item.importCount,
                      firstSeenAt: item.firstSeenAt.toISOString(),
                      lastSeenAt: item.lastSeenAt.toISOString(),
                      resolvedStatus: item.resolvedStatus,
                      hasEmbed: Boolean(item.embedUrl),
                    }}
                  />
                </div>

                {item.embedUrl ? (
                  <div className="mt-3">
                    <BandcampEmbedPlayer src={item.embedUrl} title={releaseTitle} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
                    Player unavailable. Open the status menu for details and retry
                    options.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

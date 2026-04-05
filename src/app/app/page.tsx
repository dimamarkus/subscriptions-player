import Link from "next/link";
import { redirect } from "next/navigation";

import { QueueItemStatusActions } from "@/components/queue-item-status-actions";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { getServerEnv } from "@/lib/env/server";
import { formatInboundAliasAddress } from "@/lib/inbound-aliases/format-inbound-alias-address";
import { getActiveInboundAlias } from "@/lib/inbound-aliases/get-active-inbound-alias";
import { listUserQueueItems } from "@/lib/releases/list-user-queue-items";

export default async function AppHomePage() {
  const currentUser = await ensureAppUser();
  const inboundAlias = await getActiveInboundAlias(currentUser.id);

  if (!inboundAlias) {
    redirect("/app/onboarding");
  }

  const queueItems = await listUserQueueItems(currentUser.id);

  const forwardingAddress = formatInboundAliasAddress(
    inboundAlias.token,
    getServerEnv().INBOUND_EMAIL_DOMAIN,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold tracking-[0.24em] text-zinc-400">
          QUEUE FOUNDATION
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Your account and forwarding address are ready.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
          The core Phase 1 foundation is complete. Phase 2 now gives each user a
          stable address they can use to forward Bandcamp emails into the app.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-lg font-semibold text-white">Forwarding address</h2>
          <dl className="mt-4 space-y-3 text-sm text-zinc-300">
            <div>
              <dt className="text-zinc-400">Email</dt>
              <dd className="mt-1 break-all font-medium text-white">
                {forwardingAddress}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Signed-in account</dt>
              <dd className="mt-1 font-medium text-white">{currentUser.email}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-lg font-semibold text-white">What to do next</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-300">
            <p>
              Go through the onboarding instructions, then forward a Bandcamp
              email to this address. Imported release links will land below as
              queue items.
            </p>
            <Link
              href="/app/onboarding"
              className="inline-flex rounded-full border border-white/15 px-4 py-2 font-medium text-zinc-100 transition hover:border-white/30"
            >
              Open onboarding
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Listening queue</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Phase 4 currently stores queue items as normalized Bandcamp links
              with graceful URL-only fallbacks.
            </p>
          </div>
          <Link
            href="/app/imports"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
          >
            View imports
          </Link>
        </div>

        {queueItems.length === 0 ? (
          <p className="mt-6 text-sm leading-7 text-zinc-400">
            No releases have been imported yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {queueItems.map((item) => (
              <article
                key={item.userReleaseId}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      {item.releaseType}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {item.releaseTitle ?? item.canonicalUrl}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      {item.artistName ?? item.bandcampDomain}
                    </p>
                  </div>

                  <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200">
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                  <span>Imports: {item.importCount}</span>
                  <span>Last seen: {item.lastSeenAt.toISOString()}</span>
                </div>

                <QueueItemStatusActions userReleaseId={item.userReleaseId} />

                <a
                  href={item.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
                >
                  Open on Bandcamp
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { listRecentWebhookEvents } from "@/lib/webhooks/webhook-events";

const statusClassNames: Record<string, string> = {
  received: "bg-zinc-700 text-zinc-100",
  queued: "bg-blue-500/20 text-blue-200",
  processing: "bg-amber-500/20 text-amber-200",
  imported: "bg-emerald-500/20 text-emerald-200",
  failed: "bg-red-500/20 text-red-200",
};

export default async function ImportsPage() {
  const webhookEvents = await listRecentWebhookEvents();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold tracking-[0.24em] text-zinc-400">
          IMPORTS
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Webhook events</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
          Inbound Resend events are stored here first, then handed off to the
          queue-driven import pipeline. Bandcamp imports and Gmail forwarding
          verification emails both flow through this endpoint, but only Bandcamp
          mail should create queue items.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/20 p-8">
        {webhookEvents.length === 0 ? (
          <p className="text-sm leading-7 text-zinc-400">
            No webhook events have been received yet.
          </p>
        ) : (
          <div className="space-y-4">
            {webhookEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {event.eventType}
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-zinc-400">
                      {event.providerEventId}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      statusClassNames[event.status] ?? statusClassNames.received
                    }`}
                  >
                    {event.status.replace("_", " ")}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
                  <div>
                    <dt className="text-zinc-500">Provider</dt>
                    <dd className="mt-1 text-zinc-100">{event.provider}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Queued message id</dt>
                    <dd className="mt-1 break-all text-zinc-100">
                      {event.queueMessageId ?? "Not queued"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Created</dt>
                    <dd className="mt-1 text-zinc-100">
                      {event.createdAt.toISOString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Processed</dt>
                    <dd className="mt-1 text-zinc-100">
                      {event.processedAt?.toISOString() ?? "Not processed"}
                    </dd>
                  </div>
                </dl>

                {event.error ? (
                  <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                    {event.error}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

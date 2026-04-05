import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function MarketingPage() {
  const { userId } = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.24em] text-zinc-300">
            SUBSCRIPTIONS PLAYER
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            A privacy-first Bandcamp listening queue built from forwarded emails.
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          {userId ? (
            <Link
              href="/app"
              className="rounded-full bg-white px-4 py-2 text-black transition hover:bg-zinc-200"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full border border-white/15 px-4 py-2 text-zinc-100 transition hover:border-white/30"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-white px-4 py-2 text-black transition hover:bg-zinc-200"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="grid flex-1 gap-10 py-16 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-400">
            Forward only what you want
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Turn Bandcamp emails into a clean listening queue.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Subscriptions Player gives each user a personal forwarding address,
            imports only the Bandcamp emails they choose to send, and turns them
            into a queue of releases with strong fallbacks even when metadata is
            incomplete.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={userId ? "/app" : "/sign-up"}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              {userId ? "Go to your queue" : "Start with open signup"}
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-white/30"
            >
              Sign in
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-lg font-semibold text-white">Core product rules</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-zinc-300">
            <li>No full Gmail inbox access.</li>
            <li>One forwarding address per user.</li>
            <li>Server-side parsing and queue persistence.</li>
            <li>Embeds are enrichment, not the import success condition.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}

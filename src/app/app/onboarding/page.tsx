import { rotateInboundAliasAction } from "@/actions/inbound-aliases";
import { CopyTextButton } from "@/components/copy-text-button";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { getServerEnv } from "@/lib/env/server";
import { ensureActiveInboundAlias } from "@/lib/inbound-aliases/ensure-active-inbound-alias";
import { formatInboundAliasAddress } from "@/lib/inbound-aliases/format-inbound-alias-address";

export default async function OnboardingPage() {
  const user = await ensureAppUser();
  const activeAlias = await ensureActiveInboundAlias(user.id);
  const forwardingAddress = formatInboundAliasAddress(
    activeAlias.token,
    getServerEnv().INBOUND_EMAIL_DOMAIN,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold tracking-[0.24em] text-zinc-400">
          ONBOARDING
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Your forwarding address is ready.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
          Forward only your Bandcamp emails to this address. The app will import
          only the messages you explicitly send here. It will not ask for full
          inbox access.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/20 p-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-400">
          Personal import address
        </p>
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 md:flex-row md:items-center md:justify-between">
          <code className="break-all font-mono text-sm text-white">
            {forwardingAddress}
          </code>
          <div className="flex flex-wrap gap-3">
            <CopyTextButton text={forwardingAddress} />
            <form action={rotateInboundAliasAction}>
              <button
                type="submit"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
              >
                Rotate address
              </button>
            </form>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Rotating the address invalidates the current alias and gives you a new
          one. Use that only if the address leaks or you want a fresh import
          endpoint.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-black/20 p-8">
          <h2 className="text-xl font-semibold text-white">
            Gmail filter setup
          </h2>
          <ol className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
            <li>Open Gmail and search for emails from Bandcamp.</li>
            <li>Choose Create filter.</li>
            <li>Select Forward it to and paste your import address.</li>
            <li>Apply the filter to future Bandcamp mail.</li>
          </ol>
        </article>

        <article className="rounded-3xl border border-white/10 bg-black/20 p-8">
          <h2 className="text-xl font-semibold text-white">Privacy model</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
            <li>The app only sees emails you forward.</li>
            <li>Raw email content is retained for seven days for debugging.</li>
            <li>Normalized release data can remain after raw content expires.</li>
            <li>Account-level deletion controls will live in settings.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

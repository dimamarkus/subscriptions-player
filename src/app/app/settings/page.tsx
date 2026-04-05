import { rotateInboundAliasAction } from "@/actions/inbound-aliases";
import { CopyTextButton } from "@/components/copy-text-button";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { getServerEnv } from "@/lib/env/server";
import { ensureActiveInboundAlias } from "@/lib/inbound-aliases/ensure-active-inbound-alias";
import { formatInboundAliasAddress } from "@/lib/inbound-aliases/format-inbound-alias-address";

export default async function SettingsPage() {
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
          SETTINGS
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Account settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
          Alias management is live. Retention controls and account deletion will
          be expanded in later phases.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/20 p-8">
        <h2 className="text-xl font-semibold text-white">Forwarding address</h2>
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
      </section>
    </div>
  );
}

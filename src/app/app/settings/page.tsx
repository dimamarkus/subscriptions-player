import { rotateInboundAliasAction } from "@/actions/inbound-aliases";
import { CopyTextButton } from "@/components/copy-text-button";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { getServerEnv } from "@/lib/env/server";
import { ensureActiveInboundAlias } from "@/lib/inbound-aliases/ensure-active-inbound-alias";
import { formatInboundAliasAddress } from "@/lib/inbound-aliases/format-inbound-alias-address";
import { getLatestGmailForwardingVerification } from "@/lib/inbound-emails/get-latest-gmail-forwarding-verification";

export default async function SettingsPage() {
  const user = await ensureAppUser();
  const activeAlias = await ensureActiveInboundAlias(user.id);
  const gmailForwardingVerification = await getLatestGmailForwardingVerification(
    user.id,
  );
  const forwardingAddress = formatInboundAliasAddress(
    activeAlias.token,
    getServerEnv().INBOUND_EMAIL_DOMAIN,
  );
  const gmailConfirmationUrl =
    gmailForwardingVerification?.gmailForwardingConfirmationUrl ?? null;
  const gmailConfirmationCode =
    gmailForwardingVerification?.gmailForwardingConfirmationCode ?? null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold tracking-[0.24em] text-zinc-400">
          SETTINGS
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Account settings and setup
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
          Onboarding now lives here. Configure your forwarding address, finish
          Gmail setup, and verify privacy expectations in one place.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/20 p-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-400">
          Personal import address
        </p>
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Forwarding address
              </p>
              <code className="mt-2 block break-all font-mono text-sm text-white">
                {forwardingAddress}
              </code>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Signed-in account
              </p>
              <p className="mt-2 text-sm text-zinc-200">{user.email}</p>
            </div>
          </div>
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
          <h2 className="text-xl font-semibold text-white">Gmail setup</h2>
          <ol className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
            <li>
              In Gmail, open Settings, then{" "}
              <span className="text-zinc-100">Forwarding and POP/IMAP</span>,
              and add this forwarding address.
            </li>
            <li>
              Wait for Gmail to send a forwarding confirmation email to your
              import address. We will surface it here.
            </li>
            <li>
              After Gmail confirms the address, create a filter for Bandcamp
              mail and choose <span className="text-zinc-100">Forward it to</span>.
            </li>
          </ol>

          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
              Gmail verification status
            </p>

            {gmailForwardingVerification ? (
              <div className="mt-3 space-y-4">
                <p className="text-sm leading-6 text-zinc-200">
                  We received Gmail&apos;s forwarding confirmation email for{" "}
                  <span className="font-medium text-white">{user.email}</span>.
                  If Gmail still shows this forwarding address as pending, use
                  the link or code below, then create your Bandcamp filter.
                </p>

                {gmailConfirmationUrl ? (
                  <a
                    href={gmailConfirmationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/15"
                  >
                    Open confirmation link
                  </a>
                ) : null}

                {gmailConfirmationCode ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Confirmation code
                    </p>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <code className="break-all font-mono text-sm text-white">
                        {gmailConfirmationCode}
                      </code>
                      <CopyTextButton text={gmailConfirmationCode} />
                    </div>
                  </div>
                ) : null}

                {!gmailConfirmationUrl && !gmailConfirmationCode ? (
                  <p className="text-sm leading-6 text-zinc-400">
                    The Gmail setup email was received, but no confirmation link
                    or code was extracted. Open the newest Google forwarding
                    message in your email client if you still need to confirm it.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                No Gmail forwarding confirmation email has arrived yet. Add the
                forwarding address in Gmail first, then refresh this page.
              </p>
            )}
          </div>
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

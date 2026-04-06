# Subscriptions Player

A privacy-first Bandcamp listening queue built with Next.js, Clerk, Drizzle, Neon, and Tailwind CSS.

## Current status

The app now has a real end-to-end foundation plus a narrow first import slice.

Implemented so far:

- Next.js App Router with `src/app`
- Tailwind CSS `v4`
- Clerk auth wiring
- protected `/app` shell
- Drizzle plus Neon database foundation
- local `users` table and authenticated user upsert
- onboarding and forwarding-address generation
- inbound alias rotation
- Resend webhook route
- Vercel Queues consumer wiring
- narrow Bandcamp URL extraction for `album` and `track`
- queue persistence and queue item status updates
- imports/debug page for webhook event visibility
- release metadata enrichment from Bandcamp pages
- embedded Bandcamp player rendering where resolvable
- compact queue cards with status dropdowns and hidden diagnostics

Planned next:

- production-hardening for enrichment and embed retries
- more robust import diagnostics

## Scripts

- install: `pnpm install`
- dev: `pnpm dev`
- build: `pnpm build`
- start: `pnpm start`
- lint: `pnpm lint`
- types: `pnpm check-types`
- verify: `pnpm verify`
- drizzle generate: `pnpm db:generate`
- drizzle migrate: `pnpm db:migrate`
- drizzle push: `pnpm db:push`
- drizzle studio: `pnpm db:studio`

## Runtime

- Node: `24.x`
- Package manager: `pnpm@10.33.0`

## Env

Copy `env.example` to `.env.local`.

Required now:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `INBOUND_EMAIL_DOMAIN`

Reserved for later phases:

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_RECEIVING_DOMAIN`
- `BLOB_READ_WRITE_TOKEN`

Used once inbound email and queues are wired:

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_RECEIVING_DOMAIN`

If you want to publish to Vercel Queues during local development, link the
project and pull env first:

- `vercel link`
- `vercel env pull`

## Development notes

- The app is server-first by default.
- Client components should be added only for clearly interactive UI islands.
- Clerk uses prebuilt auth UI in this phase so the team can focus on foundations instead of auth screen customization.

## Deploy notes

- Run `pnpm verify` before deploying.
- Apply Drizzle migrations manually against the target database before the first real deploy.
- Configure Resend receiving and the webhook endpoint before expecting inbound imports to work.
- See `docs/260404SUBSCRIPTIONS_PLAYER__TEST_AND_DEPLOY_CHECKLIST.md` for the exact launch sequence.

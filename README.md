# Subscriptions Player

A privacy-first Bandcamp listening queue built with Next.js, Clerk, Drizzle, Neon, and Tailwind CSS.

## Current status

Phase 1 foundation work has started.

Implemented so far:

- Next.js App Router with `src/app`
- Tailwind CSS `v4`
- Clerk auth wiring
- protected `/app` shell
- Drizzle plus Neon database foundation
- local `users` table and authenticated user upsert

Planned next:

- onboarding and forwarding-address generation
- inbound email receiving via Resend
- queue persistence and import history

## Scripts

- install: `pnpm install`
- dev: `pnpm dev`
- build: `pnpm build`
- start: `pnpm start`
- lint: `pnpm lint`
- types: `pnpm check-types`
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

If you want to publish to Vercel Queues during local development, link the
project and pull env first:

- `vercel link`
- `vercel env pull`

## Development notes

- The app is server-first by default.
- Client components should be added only for clearly interactive UI islands.
- Clerk uses prebuilt auth UI in this phase so the team can focus on foundations instead of auth screen customization.

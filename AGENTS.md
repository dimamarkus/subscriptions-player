# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**TraxHunter** (`subscriptions-player`) is a single Next.js 16 app (not a monorepo). It's a privacy-first Bandcamp listening queue that parses forwarded emails into playable release cards.

**Tech stack:** Next.js 16 (App Router, Turbopack), React 19, Clerk auth, Drizzle ORM + Neon Postgres, Resend (inbound email), Vercel Queues, Tailwind CSS v4, Zod.

### Runtime requirements

- **Node 24.x** (pinned in `.nvmrc` and `engines`)
- **pnpm 10.33.0** (pinned in `packageManager`; use `corepack enable` to activate)

### Key commands

See `README.md` → **Scripts** section. Quick reference:

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Dev server | `pnpm dev` |
| Lint | `pnpm lint` |
| Type check | `pnpm check-types` |
| Full verify | `pnpm verify` (lint + types + build) |
| Build | `pnpm build` |

### Environment variables

Copy `env.example` → `.env.local`. Four env vars are validated at boot via Zod (see `src/lib/env/server.ts`):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — must be a valid Clerk publishable key (format: `pk_test_<base64>`)
- `CLERK_SECRET_KEY`
- `DATABASE_URL` — Neon Postgres connection string
- `INBOUND_EMAIL_DOMAIN`

The Clerk middleware (`src/proxy.ts`) validates the publishable key format on every request. Using a randomly-generated placeholder will cause a 500 on all routes. A validly-formatted test key (e.g. `pk_test_Y2xlcmsudGVzdC5sY2wuZGV2JA==`) allows the marketing page (`/`) to render, but auth pages (`/sign-in`, `/sign-up`) and protected routes (`/app/*`) require a real Clerk project.

### Gotchas

- **Middleware is in `src/proxy.ts`**, not the typical `middleware.ts` location. This is the Clerk `clerkMiddleware` wrapper.
- **No test suite exists** — there are no unit/integration tests in this codebase yet. `pnpm lint` and `pnpm check-types` are the primary automated checks.
- **No Docker** — the app is fully serverless-oriented. No `docker-compose` or `Dockerfile`.
- **Vercel Queues** are required for the email import pipeline but not for the core UI/dev server.
- **`pnpm.onlyBuiltDependencies`** in `package.json` lists packages allowed to run postinstall scripts. If `pnpm install` warns about ignored build scripts, they're non-blocking.

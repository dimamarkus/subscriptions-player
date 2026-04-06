# TraxHunter Player Test And Deploy Checklist

This document is the exact sequence to use to test and deploy the current app safely.

It assumes:

- the app code is already in the repo
- you want a real hosted deploy, not just local dev
- you want to validate auth, onboarding, webhook ingestion, and the narrow import pipeline before continuing product work

## Deployment philosophy

Do this in two passes:

1. get auth, onboarding, and the app shell working in production
2. then connect Resend inbound receiving and verify webhook-to-queue imports

That is slower by a little, but much safer than debugging Clerk, Neon, DNS, Resend, and queue delivery all at once.

---

## 1. Create a local checkpoint

Run:

```bash
cd /Users/dima/vhosts/personal/subscriptions-player
git status
git add .
git commit -m "feat: build subscriptions player foundation and import slice"
```

Do not deploy from a dirty working tree unless you are intentionally testing uncommitted code.

---

## 2. Use the pinned runtime

Run:

```bash
nvm use 24
node -v
pnpm -v
```

Expected:

- Node `24.x`
- pnpm `10.33.0`

---

## 3. Install dependencies

Run:

```bash
pnpm install
```

---

## 4. Create local env

Run:

```bash
cp env.example .env.local
```

Fill in at least:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
INBOUND_EMAIL_DOMAIN=
```

For inbound email testing, also fill in:

```env
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
RESEND_RECEIVING_DOMAIN=
```

---

## 5. Create the database

Create a dedicated Neon database for the app.

Then set:

```env
DATABASE_URL=...
```

Use a real app-owned database. Do not test against a random shared database if you can avoid it.

---

## 6. Apply migrations locally

Run:

```bash
pnpm db:migrate
```

If this fails, fix the DB state before moving on.

---

## 7. Create and configure the Clerk app

In Clerk:

1. Create the app
2. Enable:
   - Email/password
   - Email magic links
   - Google
3. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

For local development, make sure Clerk allows these URLs:

- `http://localhost:3000/sign-in`
- `http://localhost:3000/sign-up`
- `http://localhost:3000/app`
- `http://localhost:3000/app/onboarding`

---

## 8. Run the verification suite

Run:

```bash
pnpm verify
```

This runs:

- lint
- typecheck
- production build

Do not deploy if this command fails.

---

## 9. Start the app locally

Run:

```bash
pnpm dev
```

---

## 10. Run the local auth and onboarding smoke test

In the browser:

1. Open `http://localhost:3000`
2. Verify the landing page loads
3. Create an account
4. Confirm you land in `/app/onboarding`
5. Confirm a forwarding address is shown
6. Confirm rotating the address gives a new address
7. Confirm `/app`, `/app/settings`, and `/app/imports` load
8. Confirm signed-out access to `/app` redirects to auth

---

## 11. Link the project to Vercel

Run:

```bash
vercel link
```

If you want local Vercel Queue publishing support too, then run:

```bash
vercel env pull
```

---

## 12. Create Vercel environment variables

In Vercel, configure these for Preview and Production:

Required app vars:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `INBOUND_EMAIL_DOMAIN`

Inbound email vars:

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_RECEIVING_DOMAIN`

---

## 13. Create the production database

Create a separate Neon production database.

Set the production `DATABASE_URL` in Vercel to that database.

Do not reuse your local database as the production database.

---

## 14. Apply production migrations manually

This repo does not currently auto-run Drizzle migrations during Vercel deploys.

That is intentional for now.

Before the first real deploy, run:

```bash
DATABASE_URL="your-production-database-url" pnpm db:migrate
```

Do this deliberately and confirm it succeeds.

---

## 15. Configure Resend inbound receiving

In Resend:

1. Set up a receiving domain such as:
   - `inbox.yourdomain.com`
2. Add the required MX records in DNS
3. Create a webhook for `email.received`
4. Set the endpoint to:
   - `https://your-vercel-domain/api/webhooks/resend/inbound`
5. Copy the signing secret into:
   - `RESEND_WEBHOOK_SECRET`

Set:

```env
INBOUND_EMAIL_DOMAIN=inbox.yourdomain.com
```

This must match the domain used in generated forwarding addresses.

---

## 16. Deploy to Vercel

If using the CLI:

```bash
vercel --prod
```

Or use your normal Git-connected Vercel deploy flow.

---

## 17. Update Clerk production URLs

Once the deployed domain exists, make sure Clerk allows:

- `https://your-domain/sign-in`
- `https://your-domain/sign-up`
- `https://your-domain/app`
- `https://your-domain/app/onboarding`

If this is wrong, auth will appear broken even if the app code is fine.

---

## 18. Run the production app smoke test

In production:

1. Open landing page
2. Create an account
3. Confirm onboarding appears
4. Confirm forwarding address appears
5. Confirm rotating the address works
6. Confirm `/app/settings` and `/app/imports` load

---

## 19. Run the inbound import smoke test

Use a real Bandcamp email.

Steps:

1. Forward the email to the generated forwarding address
2. Open `/app/imports`
3. Confirm a webhook event appears
4. Confirm it moves through statuses and does not stay stuck in `received` or `queued`
5. Open `/app`
6. Confirm a queue item appears
7. Click `Open on Bandcamp`
8. Change its status with one of the server actions
9. Refresh and confirm the status persisted

---

## 20. Deployment is good enough when

Consider this deploy-ready enough to continue only if all of the following are true:

- auth works locally and in production
- onboarding works
- forwarding alias generation works
- inbound webhook is accepted
- queue consumer runs
- at least one forwarded Bandcamp email becomes a queue item
- queue item status updates persist

---

## Likely failure points

Check these first if something breaks:

- Clerk redirect URL configuration
- production DB migrations not applied
- Resend webhook secret mismatch
- receiving-domain DNS not fully propagated
- queue trigger configured but not active in deployed env
- `INBOUND_EMAIL_DOMAIN` not matching the real receiving domain

---

## After this checklist

Only after the above works should you continue with:

- metadata enrichment
- improved queue cards
- embed experiments

Those are meaningfully more brittle than the current foundation and import pipeline.

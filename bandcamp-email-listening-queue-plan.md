# Bandcamp Email Inbox → Listening Queue
## Detailed implementation plan

## 1) Goal

Build a small web app that lets a user forward only their Bandcamp emails to a dedicated address, then turns those emails into a clean listening queue with inline Bandcamp players wherever possible.

The product should **not** require full Gmail inbox access.
The privacy model is: **the user forwards only Bandcamp emails** to the app.

---

## 2) Proposed stack

- **Frontend / backend app:** Next.js (App Router, TypeScript)
- **Database:** Neon Postgres
- **ORM / migrations:** Drizzle ORM
- **Inbound email:** Resend Receiving
- **Auth:** optional for MVP; otherwise Clerk / NextAuth / simple magic-link auth
- **Hosting:** Vercel
- **Background jobs:** start with server-triggered async work; add a queue later if volume grows

---

## 3) Product scope

### MVP features
1. User signs up
2. User gets a personal forwarding address, e.g.:
   - `u_abc123@inbox.myapp.com`
3. User creates a Gmail filter or manually forwards Bandcamp emails to that address
4. App receives the email through Resend
5. App parses the email and extracts Bandcamp release URLs + metadata
6. App stores normalized releases in Neon
7. App shows a chronological queue of releases
8. App attempts to render embedded players
9. If a player cannot be resolved, app shows a release card with:
   - cover art
   - artist
   - title
   - email date
   - source email subject
   - “Open on Bandcamp”

### Nice-to-have after MVP
- Mark as listened / saved / skipped
- Favorites
- Search and filters
- Digest import status
- Bulk archive
- Deduplication review UI
- Import old emails via `.eml` upload or drag/drop forwarding
- Multiple source labels (purchases, wishlist, following, new releases, fan activity)

### Explicit non-goals for MVP
- Full Gmail OAuth integration
- Reading the user’s whole mailbox
- A perfect parser for every Bandcamp email variant on day one
- A fully general Bandcamp API integration

---

## 4) Privacy model

This is the most important product decision.

### Required behavior
- The app **must not** ask for broad Gmail read access in MVP
- The app only ingests emails the user explicitly forwards
- Each user gets a unique inbound alias
- Store only the minimum email data required to power the app

### Recommendation
Persist:
- sender
- subject
- received_at
- raw Bandcamp links found
- extracted release metadata
- selected headers
- parsed HTML snapshot only if needed for debugging

Do **not** keep full raw email forever by default.
Set a retention policy for raw message content, e.g.:
- keep full raw parsed email for 7–30 days
- keep normalized release records permanently
- let user delete imported emails / all account data

---

## 5) High-level architecture

```text
User Gmail
  -> forwards Bandcamp email
    -> user-specific address at inbox.myapp.com
      -> Resend receives email
        -> Resend sends webhook to Next.js route
          -> webhook verified
          -> app fetches full received email from Resend API
          -> parse HTML/text + extract Bandcamp URLs + metadata
          -> save email record + release records in Neon
          -> UI displays listening queue
```

---

## 6) Suggested database schema

Use Drizzle and keep the schema normalized.

### `users`
- `id` uuid pk
- `email` text unique
- `created_at` timestamptz
- `forwarding_token` text unique
- `forwarding_address` text unique
- `status` text
- `settings_json` jsonb

### `inbound_emails`
- `id` uuid pk
- `user_id` uuid fk -> users.id
- `resend_email_id` text unique
- `message_id_header` text nullable
- `from_email` text
- `to_email` text
- `subject` text
- `received_at` timestamptz
- `html_body` text nullable
- `text_body` text nullable
- `headers_json` jsonb nullable
- `parse_status` text
- `parse_error` text nullable
- `raw_links_json` jsonb
- `created_at` timestamptz

### `releases`
- `id` uuid pk
- `canonical_url` text unique
- `bandcamp_domain` text
- `artist_name` text nullable
- `release_title` text nullable
- `release_type` text nullable
- `cover_image_url` text nullable
- `embed_url` text nullable
- `embed_html` text nullable
- `resolved_status` text
- `metadata_json` jsonb
- `created_at` timestamptz
- `updated_at` timestamptz

### `user_releases`
Join table because the same release may belong to multiple users.

- `id` uuid pk
- `user_id` uuid fk -> users.id
- `release_id` uuid fk -> releases.id
- `source_email_id` uuid fk -> inbound_emails.id
- `first_seen_at` timestamptz
- `queue_position` bigint nullable
- `status` text
  - `new`
  - `listened`
  - `saved`
  - `skipped`
  - `archived`
- `notes` text nullable
- `is_duplicate` boolean default false
- unique index on (`user_id`, `release_id`, `source_email_id`)

### `release_links`
Store every link found for debugging / normalization.

- `id` uuid pk
- `inbound_email_id` uuid fk
- `raw_url` text
- `normalized_url` text
- `link_type` text
- `created_at` timestamptz

### `webhook_events`
- `id` uuid pk
- `provider` text
- `event_type` text
- `provider_event_id` text nullable
- `payload_json` jsonb
- `processed_at` timestamptz nullable
- `status` text
- `error` text nullable
- `created_at` timestamptz

### `parser_logs` (optional but useful)
- `id` uuid pk
- `inbound_email_id` uuid fk
- `stage` text
- `message` text
- `data_json` jsonb nullable
- `created_at` timestamptz

---

## 7) URL normalization strategy

This is critical for dedupe quality.

### Goal
Multiple emails may point to the same Bandcamp release using slightly different links.
Normalize to one canonical release URL.

### Rules
- Lowercase hostname
- Remove tracking parameters / query strings where safe
- Remove fragments
- Keep path
- Normalize trailing slash behavior consistently
- Reject non-Bandcamp domains unless allowlisted
- Treat album and track URLs as different entities unless product requirements say otherwise

### Example
- `https://artist.bandcamp.com/album/foo?from=fanpub_fnb`
- `https://artist.bandcamp.com/album/foo`
- `https://artist.bandcamp.com/album/foo/`

All normalize to:
- `https://artist.bandcamp.com/album/foo`

### Helper
Create:
- `normalizeBandcampUrl(url: string): NormalizedBandcampLink | null`

Return:
- canonical_url
- release_type (`album`, `track`, maybe `unknown`)
- host
- path

---

## 8) Email parsing strategy

Bandcamp emails may vary by template, so the parser should be layered.

### Step 1: store source email
After webhook verification:
- fetch the full email from Resend API
- store the email record before parsing
- mark `parse_status = 'processing'`

### Step 2: extract all candidate URLs
Parse:
- HTML body
- plain text body
- headers if useful

Collect:
- all links
- dedupe them
- keep raw list for debugging

### Step 3: filter candidate links
Only keep:
- `*.bandcamp.com/album/...`
- `*.bandcamp.com/track/...`
- optionally other known release pages if discovered in real data

Ignore:
- unsubscribe
- help pages
- cart links
- login links
- marketing / blog links
- image CDN links

### Step 4: extract structured metadata
Try in this order:
1. email subject heuristics
2. visible HTML content heuristics
3. release page metadata fetch
4. fallback to URL-derived title slug

### Step 5: create or update release records
- normalize URL
- upsert into `releases`
- create `user_releases`

### Step 6: set parse result
- `parsed`
- `parsed_with_fallback`
- `failed`

---

## 9) Bandcamp player / embed strategy

Important: do not over-engineer this up front.

### Product requirement
The queue should show inline players **wherever possible**.

### Recommended implementation
Use a 3-tier strategy:

#### Tier A — known embed available
If the parser can resolve a valid embed URL or embed snippet for the release, render the Bandcamp player inline.

#### Tier B — metadata known, embed unresolved
Render a release card with:
- cover
- artist
- title
- source email date
- button: `Open on Bandcamp`
- optional button: `Retry embed resolution`

#### Tier C — minimal fallback
If metadata is weak, render:
- canonical URL
- source email subject
- import timestamp

### Engineering note
Do not block the import pipeline on perfect embed resolution.
Import first, enrich second.

### Recommendation
Build the importer so the release enters the queue immediately, then run an async enrichment pass that tries to populate:
- artist
- title
- cover art
- embed_html / embed_url

### Acceptance target
For MVP:
- the app should import nearly all valid Bandcamp release emails
- at least the majority should render as useful release cards
- inline players should appear wherever the app can confidently resolve them
- unresolved items must degrade gracefully, never disappear

---

## 10) Resend integration

## Setup
- Create and verify a subdomain for receiving, e.g.:
  - `inbox.myapp.com`
- Configure inbound receiving in Resend
- Add the required MX record
- Create webhook for `email.received`

## Next.js routes

### `POST /api/webhooks/resend/inbound`
Responsibilities:
1. read raw request body
2. verify webhook signature
3. persist webhook event
4. extract Resend received email ID
5. enqueue or immediately trigger processing
6. return 200 quickly

### `POST /api/internal/process-inbound-email`
Responsibilities:
1. fetch received email from Resend API
2. map inbound alias -> user
3. store `inbound_emails`
4. parse content
5. create/upsert release records
6. update parse status

### `POST /api/internal/enrich-release`
Responsibilities:
1. fetch release page if needed
2. try to resolve title/artist/cover/embed
3. update `releases`

For MVP, this can be called inline or with a simple background trigger.
Later, move to a real queue.

---

## 11) User-specific forwarding addresses

Each user should get a stable unique forwarding address.

### Pattern
- `u_<random-token>@inbox.myapp.com`

Examples:
- `u_a8k29sdf@inbox.myapp.com`
- `u_dima_4f91ac@inbox.myapp.com`

### Why
- easy routing
- no auth needed at inbound time
- avoids exposing real user email in the inbound alias

### Resolution
On inbound:
- look at the `to` address
- extract token
- map token -> `users.id`

---

## 12) Auth and account model

### MVP simplest option
- passwordless magic link auth
- account page shows:
  - forwarding address
  - setup instructions
  - recent imports
  - privacy / delete data options

### Onboarding page should include
1. copy button for forwarding address
2. sample Gmail filter instructions
3. manual forward instructions
4. note that only forwarded emails are imported

---

## 13) UI plan

## Main pages

### `/`
Marketing / landing page
- explain privacy model
- explain that the user forwards only Bandcamp emails
- CTA: create account

### `/app`
Main queue view

#### Layout
- left/top controls:
  - filter by status
  - sort by newest / oldest / artist
  - search
- main feed:
  - release cards with embedded players where available
- actions per item:
  - listened
  - save
  - skip
  - archive
  - open on Bandcamp

### `/app/imports`
Debugging/import history page
- imported emails
- parse status
- errors
- count of extracted releases

### `/app/settings`
- forwarding address
- privacy settings
- delete account
- raw email retention preference
- regenerate forwarding token

---

## 14) UI details for each queue card

Each item should show:
- cover art
- release title
- artist
- canonical Bandcamp domain
- imported date
- source email subject
- inline player if available
- fallback button if not

### Actions
- `Mark listened`
- `Save`
- `Skip`
- `Archive`
- `Open on Bandcamp`

### Optional compact metadata
- source type
  - purchase
  - wishlist
  - new release
  - following
  - unknown

---

## 15) Parsing heuristics

Build the parser defensively.

### Classify email type from:
- sender
- subject
- visible content
- common Bandcamp patterns

### Possible types
- purchase receipt
- new release from followed artist/label
- wishlist / recommendation
- download email
- fan activity
- unknown

### Why classification matters
Different email types may put the best release link in different places.
Classification improves extraction accuracy.

---

## 16) Error handling

### Common failure cases
- email forwarded with stripped HTML
- email contains no release link
- multiple release links in one email
- Bandcamp page unavailable
- artist page exists but release metadata is incomplete
- duplicate forward of same email
- user forwards non-Bandcamp email

### Expected behavior
- never hard-fail the whole import if one step fails
- always store enough debug info to retry
- unresolved imports should be visible in admin/import history

### Retry behavior
- webhook processing retries idempotently
- release enrichment retries separately
- use unique constraints to prevent duplicate inserts

---

## 17) Idempotency and dedupe

### Email-level dedupe
Use:
- `resend_email_id`
- `message_id_header` if available

### Release-level dedupe
Use:
- `canonical_url`

### User-release-level dedupe
A user may import the same release multiple times.
Decide product behavior:

#### Recommended
- keep one visible queue item per user + release
- keep a hidden history of source emails
- increment an occurrence count if re-imported

If using this approach, add:
- `import_count` to `user_releases`

---

## 18) Security requirements

### Required
- verify Resend webhook signature
- rate-limit public routes
- sanitize stored HTML if any of it will ever be rendered
- never trust email HTML directly in the client
- use parameterized queries / ORM
- protect internal processing routes
- validate all URLs before fetch
- allowlist Bandcamp domains only

### Important
Any server-side fetch of release pages should:
- enforce timeout
- limit redirects
- reject private/internal IPs
- set conservative user-agent
- use SSRF protections

---

## 19) Neon / Drizzle setup

### Recommendation
Use separate Neon branches / environments:
- `production`
- `staging`
- `development`

### Drizzle workflow
- define schema in TypeScript
- generate migrations
- apply migrations in CI/CD or deploy pipeline

### Good practice
Store the following in env:
- `DATABASE_URL`
- `DATABASE_URL_POOLED` if desired
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `APP_BASE_URL`

---

## 20) Suggested file structure

```text
/src
  /app
    /(marketing)
      page.tsx
    /app
      page.tsx
      /imports
        page.tsx
      /settings
        page.tsx
    /api
      /webhooks
        /resend
          /inbound
            route.ts
      /internal
        /process-inbound-email
          route.ts
        /enrich-release
          route.ts

  /db
    schema.ts
    client.ts
    migrations/

  /lib
    /email
      parse-bandcamp-email.ts
      classify-bandcamp-email.ts
      extract-links.ts
    /bandcamp
      normalize-bandcamp-url.ts
      enrich-release.ts
      resolve-embed.ts
    /resend
      verify-webhook.ts
      get-received-email.ts
    /auth
    /utils

  /components
    release-card.tsx
    release-player.tsx
    import-status-badge.tsx
```

---

## 21) Implementation phases

## Phase 1 — foundation
- create Next.js app
- configure Neon + Drizzle
- define schema
- configure Resend receiving domain + webhook
- create inbound webhook route
- verify webhook signatures
- store webhook events

### Deliverable
A received email is logged successfully in Neon.

---

## Phase 2 — import pipeline
- fetch full email from Resend API
- map inbound alias to user
- store inbound email
- extract all URLs
- normalize Bandcamp URLs
- create release rows and user_release rows

### Deliverable
Forwarded Bandcamp emails produce queue items.

---

## Phase 3 — queue UI
- auth
- onboarding page with forwarding address
- queue page
- release cards
- item actions
- imports/debug page

### Deliverable
User can sign in and browse imported items.

---

## Phase 4 — enrichment + embed
- async enrichment pass
- fetch additional release metadata when needed
- attempt embed resolution
- show inline players where available
- fallback cleanly when not available

### Deliverable
Queue becomes polished and playable.

---

## Phase 5 — reliability
- retries
- better parse logs
- dedupe improvements
- account deletion
- retention settings
- analytics

### Deliverable
Production-hardening.

---

## 22) Acceptance criteria

### Functional
- User can create account
- User gets personal forwarding address
- Forwarded Bandcamp email appears in app
- App extracts at least one release URL from standard Bandcamp emails
- App dedupes repeated forwards
- App renders release cards reliably
- App shows inline players when resolved
- App provides a graceful fallback when embed is unavailable

### Privacy
- No Gmail OAuth required
- Only forwarded emails are processed
- User can delete imported data
- Raw email retention is limited / configurable

### Reliability
- Webhook endpoint is idempotent
- Failed parses are visible and retryable
- Duplicate events do not create duplicate rows

---

## 23) Simple product copy for onboarding

### Heading
Forward only your Bandcamp emails.

### Body
We only process emails you explicitly forward to your personal import address. We do not ask for access to your full inbox.

### Setup steps
1. Copy your import address
2. Create a Gmail filter for Bandcamp emails, or manually forward them
3. Open your listening queue

---

## 24) Developer notes / tradeoffs

1. **Do not block MVP on perfect Bandcamp embed automation**
   - import + queue is the real core value
   - embed resolution can improve over time

2. **Preserve debuggability**
   - email parsing always becomes template-driven and messy
   - keep logs and raw extracted links

3. **Optimize for privacy first**
   - forwarding model is the product advantage

4. **Keep the importer idempotent**
   - retries and duplicate forwards will happen

5. **Use graceful degradation**
   - queue item with link is better than a failed import

---

## 25) Recommended MVP definition

Ship when the following works end-to-end:

- account creation
- personal forwarding address
- Resend inbound webhook
- full email fetch from Resend API
- Bandcamp link extraction
- Neon persistence
- queue UI
- listened/saved/skipped actions
- fallback release cards
- at least basic inline player support where resolvable

That is enough to validate the product before solving every parsing edge case.

---

## 26) One-sentence summary for the developer

Build a Next.js app backed by Neon and Drizzle that receives only user-forwarded Bandcamp emails through Resend, parses Bandcamp release links into normalized records, and renders a privacy-friendly listening queue with inline players when available and clean release-card fallbacks when not.

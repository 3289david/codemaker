# CodeMaker

A code-outsourcing / dev-agency order platform. Customers browse services, get an automatic
price estimate from a feature-weighted calculator, submit an order, receive a formal quote,
pay via bank-transfer confirmation, track production status, chat with the assigned admin,
request revisions, and download versioned deliverables. Admins run the whole pipeline from a
separate back office with TOTP 2FA.

Built as an independent codebase that follows the architectural conventions already used on
this VPS (see `jabishop` for the reference pattern: Next.js App Router + Prisma/SQLite +
server actions + cookie/JWT sessions + TOTP admin 2FA). No business logic was copied — only
the project shape.

## Tech stack

Next.js 16 (App Router, TypeScript), Prisma + SQLite, Tailwind CSS v4, bcryptjs, jose (JWT
session cookies), zod, otpauth + qrcode (admin TOTP 2FA). Server Actions under
`src/lib/actions` handle almost all mutations; a handful of API routes under `src/app/api`
handle the order chat (polling), deliverable downloads, and public JSON status lookup.

## Project layout

```
src/app/(shop)/        public site + authenticated customer area (mypage/*)
src/app/admin/          admin login (Google OAuth only) and admin/(protected)/* back office
src/app/api/auth/       Google/GitHub OAuth redirect + callback routes
src/app/api/            chat polling endpoint, deliverable download, public status lookup
src/lib/actions/        server actions (mutations), grouped by area
src/lib/                session/auth, oauth, settings, pricing calculator, storage, etc.
src/bot/                standalone Discord bot process (slash commands), run via PM2 separately
src/components/         shared UI; src/components/admin for admin-only widgets
prisma/schema.prisma    data model (SQLite; "enum" fields are plain strings, see src/lib/constants.ts)
prisma/seed.ts          seed script (services, pricing rules, portfolio, FAQ, notices, sample orders)
uploads/                local file storage for uploads (gitignored; created at runtime/seed)
```

## Core order flow (the demo-able part)

1. **Estimate** — `/calculator`: pick a project type + feature checkboxes, get an estimated
   price range and duration computed from DB-editable weights (`ProjectTypeRule`,
   `PricingRule` — admin-editable under `/admin/services`, not hardcoded).
2. **Order** — `/order/new`: submit the request (works for logged-in users and guests, as long
   as the "비회원 주문 허용" toggle in `/admin/settings` is on — it is by default; guests set a
   PIN and get a human-friendly order number like `#A-10004`). A Discord notification fires if
   configured (webhook URL or bot token+channel, from `/admin/settings` or env — silently
   skipped otherwise).
3. **Track** — `/order/track/[orderNo]?pin=...` (guest) or `/mypage/orders/[id]` (member):
   status timeline, progress bar, quote card, payment card, deliverables, per-order chat
   (polling every 5s via `/api/orders/[orderId]/messages`), revision requests.
4. **Quote** — admin drafts amount/duration/included features in `/admin/orders/[id]`; the
   customer sees a quote card and clicks "견적 승인" to move to 결제대기 and create a
   `Payment` row.
5. **Payment** — bank-transfer confirmation flow: customer clicks "입금 완료 알림", admin
   confirms receipt in the admin order detail page, order flips to 제작중.
6. **Production → delivery** — admin sets progress %/due date, uploads versioned
   deliverables (v1.0, v1.1, Final...), customer downloads once the admin marks a file
   visible. Customer can request revisions while in 검수중/수정중; admin tracks
   요청확인 → 수정중 → 완료. On 완료, the customer can leave a star rating + review, which
   an admin approves/hides/replies to.

Order status machine: `접수 → 견적확인 → 결제대기 → 제작중 → 검수중 → 수정중 → 완료`, plus a
`취소` side-state. Every transition is recorded in `OrderStatusHistory` with a timestamp and
optional note.

## Login: customer OAuth + admin (Google-only)

**Customers** can sign in with email/password, **Google**, or **GitHub** (`/login`). OAuth
users are matched/created by email (`src/lib/oauth.ts`); if an email already has a
password account, signing in with Google/GitHub links the provider id to that same
account rather than creating a duplicate. `User.passwordHash` is nullable for OAuth-only
accounts.

**Admins** sign in at `/admin/login` with **Google only** — there is no password/TOTP login
anymore. The flow: click "Google로 관리자 로그인" → Google OAuth → if the returned email
matches an `AdminUser.email` in the DB, an admin session is issued (logged in
`AdminLoginLog` with reason `google-oauth`); otherwise the login is rejected with a clear
error and **no account is auto-created**. `prisma/seed.ts` sets the seeded `admin` account's
`email` to `ADMIN_GOOGLE_EMAIL` (default `davideom0414@gmail.com`) if it isn't already set.
Because this is now the *only* way into `/admin`, make sure `GOOGLE_CLIENT_ID`/`SECRET` are
configured (env or `/admin/settings`) and that `AdminUser.email` is correct before relying on
it in production — there is intentionally no password fallback.

## Discord: notifications + bot

- **New-order notifications**: fires on every new order via `src/lib/discordNotify.ts`,
  using either a webhook URL or (if no webhook is set) a bot token + channel ID — both
  configurable from `/admin/settings` (DB) or env (fallback). Toggle on/off from the same page.
- **Discord bot** (`src/bot/`, run as a separate PM2 process `codemaker-bot`, not part of the
  Next.js server): 3 admin-only slash commands — `/주문목록` (recent/pending orders),
  `/주문 <주문번호>` (one order's detail), `/공지 <내용>` (create a Notice). Access is
  restricted to Discord user/role IDs listed in `/admin/settings` (`discordAdminUserIds`/
  `discordAdminRoleIds`, or `DISCORD_ADMIN_USER_IDS`/`DISCORD_ADMIN_ROLE_IDS` env). If
  `DISCORD_BOT_TOKEN` is unset, `src/bot/index.ts` logs a message and exits cleanly (no crash
  loop). Deploy slash commands with `npm run bot:deploy` after changing them or the bot's
  guild ID; run the bot directly with `npm run bot:start` / `npm run bot:dev` (watch mode).

## Running locally

```bash
npm install
cp .env.example .env   # edit secrets as needed
npx prisma db push     # creates prisma/dev.db from schema.prisma
npm run seed            # admin account, sample services/pricing/portfolio/orders
npm run dev              # http://localhost:3000 (or PORT=3014 npm run dev to match prod)
```

`npm run build && npm run start` runs the production build (this is what PM2 runs).

## Environment variables

Every setting below marked "DB override" can also be set from `/admin/settings` at runtime —
the DB value wins if present, otherwise the app falls back to the env var (see
`src/lib/settings.ts`). This means the app works out of the box from `.env` alone, but an
admin can rotate secrets/toggle features without a redeploy.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite file path, e.g. `file:./dev.db` |
| `SESSION_SECRET` | yes | HMAC key for customer JWT session cookies |
| `ADMIN_SESSION_SECRET` | yes | HMAC key for admin JWT session cookies |
| `SEED_ADMIN_ID` / `SEED_ADMIN_PASSWORD` | seed only | admin account created by `npm run seed` (password is set but no longer used for login — see below) |
| `SEED_CUSTOMER_EMAIL` / `SEED_CUSTOMER_PASSWORD` | seed only | sample customer account |
| `ADMIN_GOOGLE_EMAIL` | no | Google account granted admin access; default `davideom0414@gmail.com`. Seed sets `AdminUser.email` to this. |
| `NEXT_PUBLIC_APP_ORIGIN` | recommended | public origin the app is reached at (e.g. `https://codemaker.krl.kr`) — used to build OAuth redirect URIs and links in Discord embeds. **Rebuild (`npm run build`) after changing** — it's a `NEXT_PUBLIC_*` var, inlined at build time. |
| `DISCORD_WEBHOOK_URL` | no (DB override) | if unset/unconfigured, new-order Discord notifications are silently skipped. Get one from Discord Server Settings > Integrations > Webhooks. |
| `DISCORD_NOTIFY_CHANNEL_ID` | no (DB override) | channel the bot posts order notifications to, if using the bot instead of a webhook |
| `DISCORD_CLIENT_ID` | needed for the bot | Discord application ID (Developer Portal), env-only (not a DB setting) |
| `DISCORD_BOT_TOKEN` | needed for the bot (DB override) | Discord bot token — treat as a secret |
| `DISCORD_GUILD_ID` | no (DB override) | server ID for instant (vs. up-to-1hr global) slash command registration |
| `DISCORD_ADMIN_USER_IDS` / `DISCORD_ADMIN_ROLE_IDS` | needed for bot admin commands (DB override) | comma-separated Discord user/role IDs allowed to run `/주문목록`, `/주문`, `/공지` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | needed for Google login (DB override) | Google Cloud Console > Credentials > OAuth client ID (Web application). Redirect URI: `<NEXT_PUBLIC_APP_ORIGIN>/api/auth/google/callback` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | needed for GitHub login (DB override) | GitHub > Developer settings > OAuth Apps. Callback URL: `<NEXT_PUBLIC_APP_ORIGIN>/api/auth/github/callback` |

See `.env.example` for a fully-annotated copy of all of the above, including step-by-step
"how to obtain this" notes for each Discord/Google/GitHub credential.

## What's genuinely working vs. stubbed/mocked

**Fully working, DB-backed, exercised end to end:**
- Quote calculator with admin-editable pricing rules
- Order submission (member + guest/PIN), order number generation, Discord webhook (if configured)
- Full status machine with history, admin status/progress/due-date/memo/assignment controls
- Quote drafting → customer approval → payment record creation
- Bank-transfer "무통장입금" confirmation flow (customer notify → admin confirm)
- Per-order chat (polling-based, works for admin and customer/guest, read receipts, pinned messages)
- Revision requests (customer submit → admin 요청확인/수정중/완료)
- Versioned deliverables with visibility toggle and an ownership-checked download route
- Reviews (submit → admin approve/hide/delete/reply), Notices, FAQ, Portfolio, Services — full admin CRUD
- 1:1 inquiries (customer submit, admin reply, notification on answer)
- In-app notifications (bell + list) for the events listed in the spec
- Admin back office: dashboard/stats, order/member/service/portfolio/review/notice/FAQ/inquiry
  management, admin accounts + roles, admin session list/revoke, simple DB-backed login rate
  limiting. `totpSecret`/`totpEnabled` fields and the `/admin/security/2fa` page still exist
  in the schema/UI but are no longer part of the login path now that admin login is
  Google-only (see "Login" section above) — harmless to leave, not actively used.
- Admin-configurable Settings (`/admin/settings`, `Setting` singleton row): site info, bank
  account, guest-order/auto-approve-review toggles, Discord webhook/bot config (secrets
  masked, blank = keep existing), OAuth client IDs/secrets. DB value wins over env fallback.
- Google/GitHub OAuth customer login + Google-only admin login (see "Login" section above).
- Discord bot with 3 admin slash commands, run as its own PM2 process (see "Discord" section).
- Guest order flow re-verified end to end by driving the real Next.js Server Action HTTP
  protocol (not calling the function directly) — see final report for the exact requests/results.

**Explicitly stubbed/mocked (by design, called out per the spec):**
- **Payment gateway**: there are no real payment credentials, so payment is bank-transfer
  confirmation only. The bank account shown in `/admin/settings` and on the payment card is a
  **placeholder — replace with a real account before taking real money.**
- **OAuth login** (Google/GitHub): the code is fully implemented (`src/lib/oauth.ts`, the
  `/api/auth/*` routes, buttons on `/login`, and the Google-only `/admin/login`), but this
  environment has no real Google/GitHub OAuth app credentials — **only the token-exchange
  network calls are unverified**. The email-matching logic that decides admin access was
  verified directly against the seeded DB (see final report). Paste real
  `GOOGLE_CLIENT_ID`/`SECRET` and `GITHUB_CLIENT_ID`/`SECRET` (env or `/admin/settings`) to
  light it up end to end.
- **Discord bot**: fully implemented and verified live with a real bot token — see final
  report for the exact PM2/login confirmation. Slash commands were deployed globally (no
  guild ID was provided); pass one for instant per-server registration.
- **Email delivery**: `User.emailVerified` / `emailVerifyToken` fields exist and a token is
  generated at signup, but no SMTP sending is wired up — verification is effectively a no-op
  today. Wiring a provider (Resend/SES/SMTP) just needs a `sendMail` call where the token is
  generated in `src/lib/actions/auth.ts`.
- **Push/email notification delivery**: notifications are in-app only (bell + `/mypage/notifications`).
- File access control: deliverable downloads are ownership-checked via
  `src/app/api/files/deliverables/[id]/route.ts` (`src/lib/orderAccess.ts`). Reference
  images/attachments the customer submits with an order are stored under `uploads/` but are
  only ever shown as filenames (not download links) in this build — add a similar
  ownership-checked route if you need customers/admins to re-download those.

## Deployment (this VPS)

- PM2 apps: `codemaker-web` (Next.js, port `3014`) and `codemaker-bot` (Discord bot, no
  HTTP port) — both in `ecosystem.config.js`.
- nginx: `https://codemaker.krl.kr` → `127.0.0.1:3014`, HTTPS via certbot (Let's Encrypt),
  HTTP redirects to HTTPS. `NEXT_PUBLIC_APP_ORIGIN` is set to this HTTPS origin.
- To renew/re-run certbot manually if ever needed:
  ```bash
  certbot --nginx -d codemaker.krl.kr --non-interactive --agree-tos -m davideom0414@gmail.com --redirect
  ```

## Known gaps / follow-up ideas

- No automated tests (unit/e2e) — manual verification only (see final report for what was checked).
- No image/thumbnail rendering for uploaded reference images or portfolio images (they're
  stored but the UI only lists filenames / uses gradient placeholders for portfolio cards).
- No pagination on admin list pages (orders/members/reviews) — fine at seed-data scale, would
  need it before this holds up with thousands of rows.
- Chat is polling-based per the spec (no websockets); fine for a demo, but a busy order thread
  would benefit from a push-based transport later.
- Rate limiting is a simple DB-backed attempt counter (per spec) — adequate for a small
  deployment, not hardened against distributed abuse.

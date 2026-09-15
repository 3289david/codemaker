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
src/app/admin/          admin login (password + TOTP) and admin/(protected)/* back office
src/app/api/            chat polling endpoint, deliverable download, public status lookup
src/lib/actions/        server actions (mutations), grouped by area
src/lib/                session/auth, pricing calculator, storage, constants, etc.
src/components/         shared UI; src/components/admin for admin-only widgets
prisma/schema.prisma    data model (SQLite; "enum" fields are plain strings, see src/lib/constants.ts)
prisma/seed.ts          seed script (services, pricing rules, portfolio, FAQ, notices, sample orders)
uploads/                local file storage for uploads (gitignored; created at runtime/seed)
```

## Core order flow (the demo-able part)

1. **Estimate** — `/calculator`: pick a project type + feature checkboxes, get an estimated
   price range and duration computed from DB-editable weights (`ProjectTypeRule`,
   `PricingRule` — admin-editable under `/admin/services`, not hardcoded).
2. **Order** — `/order/new`: submit the request (works for logged-in users and guests; guests
   set a PIN and get a human-friendly order number like `#A-10004`). A Discord webhook fires
   if `DISCORD_WEBHOOK_URL` is set (silently skipped otherwise).
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

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite file path, e.g. `file:./dev.db` |
| `SESSION_SECRET` | yes | HMAC key for customer JWT session cookies |
| `ADMIN_SESSION_SECRET` | yes | HMAC key for admin JWT session cookies |
| `SEED_ADMIN_ID` / `SEED_ADMIN_PASSWORD` | seed only | admin account created by `npm run seed` |
| `SEED_CUSTOMER_EMAIL` / `SEED_CUSTOMER_PASSWORD` | seed only | sample customer account |
| `DISCORD_WEBHOOK_URL` | no | if unset, new-order Discord notifications are silently skipped |
| `NEXT_PUBLIC_APP_ORIGIN` | no | used for a couple of absolute-URL contexts; defaults to `http://localhost:3014` |

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
  management, admin accounts + roles, TOTP 2FA (otpauth + qrcode, same pattern as jabishop),
  login log + activity log, admin session list/revoke, simple DB-backed login rate limiting

**Explicitly stubbed/mocked (by design, called out per the spec):**
- **Payment gateway**: there are no real payment credentials, so payment is bank-transfer
  confirmation only. The bank account shown in `/admin/settings` and on the payment card is a
  **placeholder — replace with a real account before taking real money.**
- **OAuth login** (Google/Discord/GitHub): not implemented — would need OAuth app credentials
  this environment doesn't have. Only email/password login exists for customers.
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

- PM2 app: `codemaker-web` (`ecosystem.config.js`), port `3014`.
- nginx: `codemaker.krl.kr` → `127.0.0.1:3014`. An HTTP-only vhost is in place; HTTPS via
  certbot is pending a DNS record (see final report / `deploy/` notes) — once DNS resolves,
  run:
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

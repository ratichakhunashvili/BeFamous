# BEFAMOUS

Creator challenges app (Georgian / English), built from the Figma file `SVPsI8Gw7iEcTwlneClYeI`
(page "03 • User — Light & Dark", dark mode only). See [PLAN.md](PLAN.md) for the phase plan and
[docs/figma-dark-frames.md](docs/figma-dark-frames.md) for the Figma frame IDs and design tokens.

## Stack

- Next.js 16 (App Router) + strict TypeScript + Tailwind CSS v4
- PostgreSQL on Neon (Frankfurt, `aws-eu-central-1`) + Drizzle ORM; Neon Object Storage for files (`src/db/schema.ts`, migrations in `drizzle/`)
- Auth.js v5: email + password, JWT cookie sessions re-checked against the DB on every request
- next-intl: Georgian (default) / English, chosen by the `locale` cookie

## Setup

1. `npm install`
2. Create `.env.local` (never commit it):
   - `DATABASE_URL`: Neon connection string
   - `AUTH_SECRET`: random string (`npx auth secret`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: the admin account created by the seed
   - `APP_URL`: public site URL, **required in production** (used in password-reset links)
   - `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: Neon Object Storage (Frankfurt project) for profile photos
3. `npm run db:migrate` to create the tables
4. `npm run db:seed` to create the admin account, starter content and a dev QR code (printed as `/qr/CODE`)
5. `npx tsx scripts/storage-cors.ts http://localhost:3001` once per site origin, so browsers may upload to storage
6. `npm run dev`

In development, password-reset links are printed in the terminal instead of being emailed.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run db:generate` | Create a migration after editing `schema.ts` |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:seed` | Create or update the admin account |
| `npm run backfill` | Give badges / vouchers for challenges completed before those rules existed |
| `npm run dev:review -- approve` | Dev only: approve / `revision "note"` / `reject "note"` the latest submitted post (until the admin panel exists) |
| `npm test` | Unit tests for the core rules (links, hashtags, voucher codes, dates, CSV, XP) |
| `npm run test:db` | Database tests (decide-once, no double XP, reward once, rate limit) — run only against `TEST_DATABASE_URL` (Neon branch "tests"), skipped if it is not set |
| `npm run dev:post -- found` | Dev only: put a post into a verification state and notify the user — `found` (59), `unavailable` (62), `metrics` (63), `refresh` (64), `expired` (61, TikTok account) |
| `npm run typecheck` / `npm run lint` | Static checks |

## Deployment (Vercel)

Live: https://befamous-six.vercel.app (project `befamous`, functions in `fra1` next to Neon Frankfurt — see `vercel.json`).

- Deploy: `npx vercel deploy --prod`
- Environment variables on Vercel (production + preview): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. Admin/test passwords and `TEST_DATABASE_URL` stay local only.
- Optional `APP_URL` (e.g. a custom domain) makes invite and reset links use that address.
- Database migrations are run from your machine (`npm run db:migrate`), not during the build.
- New domain? Add it to storage CORS: `npx tsx scripts/storage-cors.ts <origins>`.

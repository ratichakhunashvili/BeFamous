# BEFAMOUS

Creator challenges app (Georgian / English), built from the Figma file `SVPsI8Gw7iEcTwlneClYeI`
(page "03 • User — Light & Dark", dark mode only). See [PLAN.md](PLAN.md) for the phase plan and
[docs/figma-dark-frames.md](docs/figma-dark-frames.md) for the Figma frame IDs and design tokens.

## Stack

- Next.js 16 (App Router) + strict TypeScript + Tailwind CSS v4
- PostgreSQL on Neon + Drizzle ORM (`src/db/schema.ts`, migrations in `drizzle/`)
- Auth.js v5: email + password, JWT cookie sessions re-checked against the DB on every request
- next-intl: Georgian (default) / English, chosen by the `locale` cookie

## Setup

1. `npm install`
2. Create `.env.local` (never commit it):
   - `DATABASE_URL`: Neon connection string
   - `AUTH_SECRET`: random string (`npx auth secret`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: the admin account created by the seed
   - `APP_URL`: public site URL, **required in production** (used in password-reset links)
3. `npm run db:migrate` to create the tables
4. `npm run db:seed` to create the admin account
5. `npm run dev`

In development, password-reset links are printed in the terminal instead of being emailed.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run db:generate` | Create a migration after editing `schema.ts` |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:seed` | Create or update the admin account |
| `npm run typecheck` / `npm run lint` | Static checks |

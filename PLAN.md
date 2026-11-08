# BeFamous — Build Plan (awaiting approval)

## Stack (and why)
- **Next.js (App Router) + strict TypeScript** — one codebase for pages *and* backend (Server Actions / route handlers), so no separate API server to learn.
- **Tailwind CSS** — Figma dark-mode variables become CSS tokens (`--bf-bg`, `--bf-surface` #222437, `--bf-elevated` #2b2d43, `--bf-text`, `--bf-muted` #aaa7c0, `--bf-border` #3a3c50, `--bf-primary` #8054f6). The app only uses dark. Font: Noto Sans Georgian.
- **PostgreSQL (Neon) + Drizzle ORM** — typed schema and migrations. The Neon tools are already connected in this session.
- **Auth.js** — email + password (hashed), session cookies, `role` column (`user` | `admin`). Every admin page and action checks the role **on the server**.
- **File storage** for work uploads and avatars: Vercel Blob or Neon object storage.
- **i18n**: `next-intl`, Georgian (default) + English, switched on screen `69 ენა` and saved per user.
- Hosting: Vercel (optional; it also runs locally).

## Data model (main tables)
users, accounts/sessions (Auth.js), profiles (bio, avatar, locale, location), interests, user_interests,
challenges (brand, category, status, dates, rules), challenge_levels, missions (type: visit/QR, upload, social-post, invite),
participations, mission_progress, qr_codes (signed token per mission/location), checkins,
submissions (media, status: pending → approved | revision | rejected, reviewer note),
xp_events (ledger → level computed), streaks, badges, user_badges, rewards, vouchers (code, status: issued/redeemed),
notifications, invites (code, inviter, accepted), linked_social_accounts, social_posts (verification state:
waiting → found → ownership-check → verified | unavailable | metrics-unavailable | auth-expired), audit_log, account deletion (soft-delete, then purge).

## Phases (each ends with screenshots compared to Figma and your approval)
1. **Foundation**: scaffold, tokens, fonts, i18n, DB schema, migrations, seed, auth (screens 01–04, 29–31, 73).
2. **Core user flow**: interests, home, discover/search/filter, challenge detail and levels, join, missions (05–11, 32–38, 65) — done.
3. **Proof**: QR check-in (camera scan), uploads and states, revision/approval, location (12–16, 39–42, 53).
4. **Progress and rewards**: activity, XP/levels, streaks, badges, rewards, vouchers (17–23, 43–44, 47–50 badge levels, 51, 67).
5. **Social and account**: notifications, profile edit, settings, language, invites, linked accounts and post verification, delete account, business-account screen (24–28, 45–46, 52, 54–64, 66, 69–72). Removed: theme toggle and `68 გარეგნობა`.
6. **Admin** (page 04, 1440px desktop): dashboard, challenges/campaigns CRUD, mission config, submission review (approve / request revision / reject), winners, rewards/vouchers and voucher check, QR codes, users, analytics.
7. Hardening: tests for permissions and XP rules, error/empty states, deploy.

## Decisions (approved 2026-11-08)
- Database: Neon Postgres (connection string in `.env.local` only)
- Social post verification: user submits URL, admin verifies (all states stored)
- Admin: no AI generation or payments screens
- Password-reset email: logged to terminal in dev; Resend later

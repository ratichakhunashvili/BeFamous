// Database tables for BeFamous (Drizzle ORM → PostgreSQL on Neon).
// Phase 1 uses: users, passwordResetTokens, interests, userInterests.
// The other tables are defined now so later phases build on one stable model.
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  primaryKey,
  uniqueIndex,
  index,
  jsonb,
  doublePrecision,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// ---------- Users & auth ----------
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const localeEnum = pgEnum("locale", ["ka", "en"]);

export const users = pgTable(
  "users",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("user"),
    locale: localeEnum("locale").notNull().default("ka"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    city: text("city"),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    xp: integer("xp").notNull().default(0),
    // Bumped on password reset / logout-everywhere so old sessions stop working.
    sessionVersion: integer("session_version").notNull().default(0),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    // Who invited this user (54 invite link → sign-up).
    invitedById: uuid("invited_by_id").references((): AnyPgColumn => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(), // we store only a SHA-256 hash, never the raw token
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// ---------- Interests ----------
export const interests = pgTable("interests", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameKa: text("name_ka").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon"),
  chipKa: text("chip_ka"), // short filter-chip label, e.g. "კაფეები"
  chipEn: text("chip_en"),
  resultsTitleKa: text("results_title_ka"), // e.g. "კაფეების გამოწვევები"
  resultsTitleEn: text("results_title_en"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const userInterests = pgTable(
  "user_interests",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    interestId: uuid("interest_id").notNull().references(() => interests.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.interestId] })],
);

// ---------- Challenges, levels, missions ----------
export const challengeStatusEnum = pgEnum("challenge_status", ["draft", "scheduled", "active", "paused", "ended"]);

export const challenges = pgTable("challenges", {
  id: id(),
  slug: text("slug").notNull().unique(),
  titleKa: text("title_ka").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionKa: text("description_ka"),
  descriptionEn: text("description_en"),
  rulesKa: text("rules_ka"),
  rulesEn: text("rules_en"),
  brand: text("brand"),
  coverUrl: text("cover_url"), // card image (home / discover)
  heroUrl: text("hero_url"), // detail-page image (falls back to coverUrl)
  interestId: uuid("interest_id").references(() => interests.id),
  status: challengeStatusEnum("status").notNull().default("draft"),
  city: text("city"), // e.g. "tbilisi", "batumi", "kutaisi", "outside"
  // How joining works: "visit" (QR check-in then video, screen 10→11) or "video" (screen 37→38)
  kind: text("kind").notNull().default("video"),
  categoryKa: text("category_ka"), // eyebrow on detail, e.g. "ᲙᲣᲚᲘᲜᲐᲠᲘᲐ"
  categoryEn: text("category_en"),
  rewardKa: text("reward_ka"), // e.g. "50 ₾ ვაუჩერი"
  rewardEn: text("reward_en"),
  hashtags: text("hashtags"), // e.g. "#BeFamous #SecretCoffee"
  // Drawn cover when there is no photo: { icon, kicker, label }
  coverArt: jsonb("cover_art").$type<{ icon: string; kicker: string; label: string }>(),
  // "How to take part" rows on the detail screen
  steps: jsonb("steps").$type<{ icon: string; titleKa: string; titleEn: string; captionKa: string; captionEn: string; link?: "rules" }[]>(),
  // Campaign rules rows (screen 65)
  rules: jsonb("rules").$type<{ icon: string; titleKa: string; titleEn: string; captionKa: string; captionEn: string }[]>(),
  sortOrder: integer("sort_order").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  xpReward: integer("xp_reward").notNull().default(0),
  createdAt: createdAt(),
});

export const challengeLevels = pgTable("challenge_levels", {
  id: id(),
  challengeId: uuid("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  titleKa: text("title_ka").notNull(),
  titleEn: text("title_en").notNull(),
  xpRequired: integer("xp_required").notNull().default(0),
});

export const missionTypeEnum = pgEnum("mission_type", ["visit_qr", "upload", "social_post", "invite"]);

export const missions = pgTable("missions", {
  id: id(),
  challengeId: uuid("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  levelId: uuid("level_id").references(() => challengeLevels.id, { onDelete: "set null" }),
  type: missionTypeEnum("type").notNull(),
  titleKa: text("title_ka").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionKa: text("description_ka"),
  descriptionEn: text("description_en"),
  xpReward: integer("xp_reward").notNull().default(0),
  position: integer("position").notNull().default(0),
  required: boolean("required").notNull().default(true), // optional missions don't count toward progress
  // Locked until this mission is completed (e.g. video unlocks after QR visit)
  unlockAfterMissionId: uuid("unlock_after_mission_id"),
  // Location for visit missions
  placeName: text("place_name"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  config: jsonb("config"), // e.g. { minSeconds: 15, maxSeconds: 30, mediaType: "video" }
  createdAt: createdAt(),
});

export const participations = pgTable(
  "participations",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    challengeId: uuid("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    joinedAt: createdAt(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("participations_user_challenge_idx").on(t.userId, t.challengeId)],
);

export const progressStatusEnum = pgEnum("progress_status", ["not_started", "in_progress", "pending_review", "completed"]);

export const missionProgress = pgTable(
  "mission_progress",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("not_started"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    // Stored in the "created_at" column since Phase 1 (works as "last changed"); renaming needs a migration.
    updatedAt: createdAt(),
  },
  (t) => [uniqueIndex("mission_progress_user_mission_idx").on(t.userId, t.missionId)],
);

// ---------- QR check-in ----------
export const qrCodes = pgTable("qr_codes", {
  id: id(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(), // random secret printed into the QR
  label: text("label"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const checkins = pgTable(
  "checkins",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    qrCodeId: uuid("qr_code_id").notNull().references(() => qrCodes.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("checkins_user_qr_idx").on(t.userId, t.qrCodeId)],
);

// ---------- Work uploads / review ----------
export const submissionStatusEnum = pgEnum("submission_status", ["draft", "pending", "approved", "revision", "rejected"]);

export const submissions = pgTable(
  "submissions",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
    // Work is submitted as a link to the user's TikTok / Instagram post (screens 13 → 41 → 42)
    mediaUrl: text("media_url").notNull(), // the post URL
    mediaType: text("media_type").notNull(), // "post" (link) — file uploads can use "video" | "image"
    platform: text("platform"), // "tiktok" | "instagram"
    handle: text("handle"), // e.g. "@nino.creates"
    thumbnailUrl: text("thumbnail_url"), // from the platform's public preview (TikTok oEmbed)
    caption: text("caption"), // post caption, used for the hashtag check
    status: submissionStatusEnum("status").notNull().default("pending"),
    reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    reviewNote: text("review_note"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("submissions_status_idx").on(t.status)],
);

// ---------- XP, streaks, badges ----------
export const xpEvents = pgTable("xp_events", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(), // "mission", "checkin", "invite", "badge", "admin"
  refId: uuid("ref_id"),
  createdAt: createdAt(),
});

export const streaks = pgTable("streaks", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  current: integer("current").notNull().default(0),
  longest: integer("longest").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD in Asia/Tbilisi
});

/** One row per day the user was active (drives the streak calendar on screen 21). */
export const activityDays = pgTable(
  "activity_days",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    day: text("day").notNull(), // YYYY-MM-DD, Asia/Tbilisi
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/** A badge collection (18): e.g. "Street to Catwalk" with 4 levels. */
export const badges = pgTable("badges", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameKa: text("name_ka").notNull(),
  nameEn: text("name_en").notNull(),
  subtitleKa: text("subtitle_ka"), // e.g. "რითეილი და მოდა"
  subtitleEn: text("subtitle_en"),
  bonusKa: text("bonus_ka"), // final-level bonus ("ბოლო დონის ბონუსი")
  bonusEn: text("bonus_en"),
  icon: text("icon"), // list icon (18)
  heroUrl: text("hero_url"),
  coverArt: jsonb("cover_art").$type<{ icon: string; kicker: string; label: string }>(),
  interestId: uuid("interest_id").references(() => interests.id), // levels count challenges in this interest
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Badge level rule, checked automatically after completions and streak updates. */
export type BadgeRule = { type: "challenges"; count: number } | { type: "streak"; days: number };

export const badgeLevels = pgTable("badge_levels", {
  id: id(),
  badgeId: uuid("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  position: integer("position").notNull(), // 1..4
  nameKa: text("name_ka").notNull(),
  nameEn: text("name_en").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  conditionKa: text("condition_ka").notNull(),
  conditionEn: text("condition_en").notNull(),
  rule: jsonb("rule").$type<BadgeRule>().notNull(),
});

export const userBadgeLevels = pgTable(
  "user_badge_levels",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    levelId: uuid("level_id").notNull().references(() => badgeLevels.id, { onDelete: "cascade" }),
    earnedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.levelId] })],
);

// ---------- Rewards & vouchers ----------
export const rewards = pgTable("rewards", {
  id: id(),
  titleKa: text("title_ka").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionKa: text("description_ka"),
  descriptionEn: text("description_en"),
  brand: text("brand"),
  valueGel: integer("value_gel"), // voucher value in lari (null for boxes / gifts)
  usageKa: text("usage_ka").default("ერთჯერადი"),
  usageEn: text("usage_en").default("Single use"),
  xpCost: integer("xp_cost").notNull().default(0), // 0 = earned by completing the challenge
  challengeId: uuid("challenge_id").references(() => challenges.id, { onDelete: "set null" }),
  stock: integer("stock"),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const voucherStatusEnum = pgEnum("voucher_status", ["issued", "redeemed", "expired"]);

export const vouchers = pgTable("vouchers", {
  id: id(),
  rewardId: uuid("reward_id").notNull().references(() => rewards.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  status: voucherStatusEnum("status").notNull().default("issued"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// ---------- Notifications & invites ----------
export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // "submission_approved", "badge_earned", ...
    data: jsonb("data"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

// One invite code per user (54). Accepted invites are recorded on users.invitedById.
// inviteeId/acceptedAt are legacy columns kept so the migration only adds.
export const invites = pgTable(
  "invites",
  {
    id: id(),
    inviterId: uuid("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    inviteeId: uuid("invitee_id").references(() => users.id, { onDelete: "set null" }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("invites_inviter_idx").on(t.inviterId)],
);

// ---------- Social accounts & post verification (admin-verified) ----------
export const socialPlatformEnum = pgEnum("social_platform", ["instagram", "tiktok", "facebook", "youtube"]);

export const linkedSocialAccounts = pgTable(
  "linked_social_accounts",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    handle: text("handle").notNull(),
    status: text("status").notNull().default("connected"), // "connected" | "expired"
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("linked_social_user_platform_idx").on(t.userId, t.platform)],
);

export const postStatusEnum = pgEnum("post_status", [
  "waiting", // 58 ელოდება გამოქვეყნებას
  "found", // 59 პოსტი ნაპოვნია
  "ownership_check", // 60 მფლობელობა მოწმდება
  "verified",
  "auth_expired", // 61
  "unavailable", // 62
  "metrics_unavailable", // 63
  "refresh_failed", // 64
  "dismissed", // 59 "ჩემი არ არის" — the user said a found post is not theirs
]);

export const socialPosts = pgTable("social_posts", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => linkedSocialAccounts.id, { onDelete: "set null" }),
  // The submission this post was registered as (13 → 41), when it came from the user.
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
  platform: text("platform"), // "tiktok" | "instagram"
  title: text("title"), // short label shown on 57 (caption start or admin-entered)
  caption: text("caption"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  url: text("url").notNull(),
  status: postStatusEnum("status").notNull().default("waiting"),
  metrics: jsonb("metrics"), // { views, likes, comments } entered by admin; null = unknown, never 0
  metricsSource: text("metrics_source"), // where the numbers came from (e.g. "admin")
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }), // last successful metrics update (64)
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: createdAt(),
});

// ---------- Audit log (admin actions) ----------
// ---------- Winners (admin 48 / 49) ----------
// Chosen by hand from approved posts; confirmedAt set on 49 (then winners are notified).
export const challengeWinners = pgTable(
  "challenge_winners",
  {
    id: id(),
    challengeId: uuid("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    category: text("category").notNull(), // "creative" | "audience" | "business"
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
    note: text("note"),
    decidedBy: uuid("decided_by").references(() => users.id, { onDelete: "set null" }),
    decidedAt: timestamp("decided_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("challenge_winners_category_idx").on(t.challengeId, t.category)],
);

export const auditLog = pgTable("audit_log", {
  id: id(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  target: text("target"),
  data: jsonb("data"),
  createdAt: createdAt(),
});

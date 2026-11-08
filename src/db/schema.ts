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
  coverUrl: text("cover_url"),
  interestId: uuid("interest_id").references(() => interests.id),
  status: challengeStatusEnum("status").notNull().default("draft"),
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
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "approved", "revision", "rejected"]);

export const submissions = pgTable(
  "submissions",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
    mediaUrl: text("media_url").notNull(),
    mediaType: text("media_type").notNull(), // "image" | "video"
    caption: text("caption"),
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

export const badges = pgTable("badges", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameKa: text("name_ka").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionKa: text("description_ka"),
  descriptionEn: text("description_en"),
  conditionKa: text("condition_ka"),
  conditionEn: text("condition_en"),
  icon: text("icon"),
  rule: jsonb("rule"), // e.g. { type: "missions_completed", count: 5 }
});

export const userBadges = pgTable(
  "user_badges",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })],
);

// ---------- Rewards & vouchers ----------
export const rewards = pgTable("rewards", {
  id: id(),
  titleKa: text("title_ka").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionKa: text("description_ka"),
  descriptionEn: text("description_en"),
  brand: text("brand"),
  xpCost: integer("xp_cost").notNull().default(0),
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

export const invites = pgTable("invites", {
  id: id(),
  inviterId: uuid("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  inviteeId: uuid("invitee_id").references(() => users.id, { onDelete: "set null" }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: createdAt(),
});

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
]);

export const socialPosts = pgTable("social_posts", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => linkedSocialAccounts.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  status: postStatusEnum("status").notNull().default("waiting"),
  metrics: jsonb("metrics"), // { views, likes, comments } entered by admin
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  updatedAt: createdAt(),
  createdAt: createdAt(),
});

// ---------- Audit log (admin actions) ----------
export const auditLog = pgTable("audit_log", {
  id: id(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  target: text("target"),
  data: jsonb("data"),
  createdAt: createdAt(),
});

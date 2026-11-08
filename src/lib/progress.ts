// Mission progress, XP and challenge completion — the rules in one place (server only).
// Used by user actions (QR check-in, post registration) and by the admin review (Phase 6).
import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
const { missionProgress, missions, participations, users, xpEvents, notifications, submissions, challenges } = schema;

export async function awardXp(tx: Tx, userId: string, amount: number, reason: string, refId?: string) {
  if (amount <= 0) return;
  await tx.insert(xpEvents).values({ userId, amount, reason, refId });
  await tx.update(users).set({ xp: sql`${users.xp} + ${amount}` }).where(eq(users.id, userId));
}

/** Today's date in Georgia as "YYYY-MM-DD" (streak days follow Tbilisi time). */
export function tbilisiDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Yesterday's date in Georgia as "YYYY-MM-DD". */
export function tbilisiYesterday() {
  return tbilisiDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

/**
 * Counts today toward the activity streak (called on check-in, post registration, completions).
 * Consecutive days grow the streak; a missed day restarts it at 1. Also logs the day for the 21 calendar.
 */
export async function recordActivity(tx: Tx, userId: string) {
  const today = tbilisiDate();
  const yesterday = tbilisiYesterday();
  await tx.insert(schema.activityDays).values({ userId, day: today }).onConflictDoNothing();

  const row = await tx.query.streaks.findFirst({ where: eq(schema.streaks.userId, userId) });
  if (row?.lastActiveDate === today) return row.current;
  const current = row?.lastActiveDate === yesterday ? row.current + 1 : 1;
  const longest = Math.max(current, row?.longest ?? 0);
  await tx
    .insert(schema.streaks)
    .values({ userId, current, longest, lastActiveDate: today })
    .onConflictDoUpdate({ target: schema.streaks.userId, set: { current, longest, lastActiveDate: today } });
  await evaluateBadges(tx, userId); // streak badges
  return current;
}

export async function setMissionStatus(tx: Tx, userId: string, missionId: string, status: "not_started" | "in_progress" | "pending_review" | "completed") {
  await tx
    .insert(missionProgress)
    .values({ userId, missionId, status, completedAt: status === "completed" ? new Date() : null })
    .onConflictDoUpdate({
      target: [missionProgress.userId, missionProgress.missionId],
      set: { status, completedAt: status === "completed" ? new Date() : null, updatedAt: new Date() },
    });
}

/** Marks a mission done, awards its XP, and completes the challenge when every required mission is done. */
export async function completeMission(tx: Tx, userId: string, missionId: string) {
  const mission = await tx.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!mission) throw new Error("Mission not found");
  const before = await tx.query.missionProgress.findFirst({ where: and(eq(missionProgress.userId, userId), eq(missionProgress.missionId, missionId)) });
  if (before?.status === "completed") return { challengeCompleted: false };

  await setMissionStatus(tx, userId, missionId, "completed");
  await awardXp(tx, userId, mission.xpReward, "mission", missionId);

  // Are all required missions of this challenge done now?
  const required = await tx.select({ id: missions.id }).from(missions).where(and(eq(missions.challengeId, mission.challengeId), eq(missions.required, true)));
  const done = await tx
    .select({ id: missionProgress.missionId })
    .from(missionProgress)
    .where(and(eq(missionProgress.userId, userId), eq(missionProgress.status, "completed"), inArray(missionProgress.missionId, required.map((r) => r.id))));
  if (done.length < required.length) return { challengeCompleted: false };

  const [updated] = await tx
    .update(participations)
    .set({ completedAt: new Date() })
    .where(and(eq(participations.userId, userId), eq(participations.challengeId, mission.challengeId), sql`${participations.completedAt} is null`))
    .returning({ id: participations.id });
  if (updated) {
    const challenge = await tx.query.challenges.findFirst({ where: eq(challenges.id, mission.challengeId) });
    await awardXp(tx, userId, challenge?.xpReward ?? 0, "challenge", mission.challengeId);
    await tx.insert(notifications).values({ userId, kind: "challenge_completed", data: { challengeId: mission.challengeId, slug: challenge?.slug, xp: challenge?.xpReward ?? 0 } });
    await issueChallengeReward(tx, userId, mission.challengeId);
    await evaluateBadges(tx, userId);
  }
  return { challengeCompleted: Boolean(updated) };
}

// ---------- Badges ----------

/**
 * Awards every badge level whose rule the user now meets (and its XP), with a notification each.
 * challenges rule = completed challenges in the collection's interest; streak rule = current streak days.
 */
export async function evaluateBadges(tx: Tx, userId: string) {
  const levels = await tx
    .select({ level: schema.badgeLevels, badge: schema.badges })
    .from(schema.badgeLevels)
    .innerJoin(schema.badges, eq(schema.badges.id, schema.badgeLevels.badgeId));
  const earned = new Set((await tx.select({ id: schema.userBadgeLevels.levelId }).from(schema.userBadgeLevels).where(eq(schema.userBadgeLevels.userId, userId))).map((r) => r.id));

  const completedByInterest = new Map<string, number>();
  const done = await tx
    .select({ interestId: challenges.interestId })
    .from(participations)
    .innerJoin(challenges, eq(challenges.id, participations.challengeId))
    .where(and(eq(participations.userId, userId), sql`${participations.completedAt} is not null`));
  for (const d of done) if (d.interestId) completedByInterest.set(d.interestId, (completedByInterest.get(d.interestId) ?? 0) + 1);
  const streak = (await tx.query.streaks.findFirst({ where: eq(schema.streaks.userId, userId) }))?.current ?? 0;

  for (const { level, badge } of levels) {
    if (earned.has(level.id)) continue;
    const ok = level.rule.type === "streak" ? streak >= level.rule.days : (badge.interestId ? completedByInterest.get(badge.interestId) ?? 0 : 0) >= level.rule.count;
    if (!ok) continue;
    await tx.insert(schema.userBadgeLevels).values({ userId, levelId: level.id }).onConflictDoNothing();
    await awardXp(tx, userId, level.xpReward, "badge", level.id);
    await tx.insert(notifications).values({ userId, kind: "badge_earned", data: { slug: badge.slug, levelId: level.id, position: level.position } });
  }
}

// ---------- Rewards ----------

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid misreading at the counter

function voucherCode(valueGel: number | null) {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const tail = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
  return `BF–${valueGel ?? "GIFT"}–${tail}`; // en dashes, as drawn on screen 43
}

/** Issues the challenge's reward as a voucher (once per user per reward, while stock lasts). */
export async function issueChallengeReward(tx: Tx, userId: string, challengeId: string) {
  const reward = await tx.query.rewards.findFirst({ where: and(eq(schema.rewards.challengeId, challengeId), eq(schema.rewards.active, true)) });
  if (!reward) return;
  const already = await tx.query.vouchers.findFirst({ where: and(eq(schema.vouchers.userId, userId), eq(schema.vouchers.rewardId, reward.id)) });
  if (already) return;
  if (reward.stock != null) {
    const [taken] = await tx
      .update(schema.rewards)
      .set({ stock: sql`${schema.rewards.stock} - 1` })
      .where(and(eq(schema.rewards.id, reward.id), sql`${schema.rewards.stock} > 0`))
      .returning({ id: schema.rewards.id });
    if (!taken) return; // out of stock
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const [v] = await tx
      .insert(schema.vouchers)
      .values({ rewardId: reward.id, userId, code: voucherCode(reward.valueGel), expiresAt: reward.expiresAt })
      .onConflictDoNothing({ target: schema.vouchers.code })
      .returning({ id: schema.vouchers.id });
    if (v) {
      await tx.insert(notifications).values({ userId, kind: "reward_added", data: { voucherId: v.id } });
      return;
    }
  }
}

/** Admin decision on a submitted post. */
export async function reviewSubmission(submissionId: string, reviewerId: string | null, decision: "approved" | "revision" | "rejected", note?: string) {
  return db.transaction(async (tx) => {
    const sub = await tx.query.submissions.findFirst({ where: eq(submissions.id, submissionId) });
    if (!sub) throw new Error("Submission not found");
    await tx.update(submissions).set({ status: decision, reviewerId, reviewNote: note ?? null, reviewedAt: new Date() }).where(eq(submissions.id, submissionId));

    if (decision === "approved") {
      await completeMission(tx, sub.userId, sub.missionId);
      await tx.insert(notifications).values({ userId: sub.userId, kind: "submission_approved", data: { submissionId } });
    } else {
      await setMissionStatus(tx, sub.userId, sub.missionId, "in_progress");
      await tx.insert(notifications).values({ userId: sub.userId, kind: decision === "revision" ? "submission_revision" : "submission_rejected", data: { submissionId, note } });
    }
  });
}

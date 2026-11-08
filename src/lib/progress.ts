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
  }
  return { challengeCompleted: Boolean(updated) };
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

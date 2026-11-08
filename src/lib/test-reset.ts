// ⚠️ TEMPORARY: wipes one account's progress so the test account can start over.
import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function wipeProgress(userId: string) {
  const s = schema;
  await db.transaction(async (tx) => {
    await tx.delete(s.socialPosts).where(eq(s.socialPosts.userId, userId));
    await tx.delete(s.challengeWinners).where(eq(s.challengeWinners.userId, userId));
    await tx.delete(s.submissions).where(eq(s.submissions.userId, userId));
    await tx.delete(s.checkins).where(eq(s.checkins.userId, userId));
    await tx.delete(s.missionProgress).where(eq(s.missionProgress.userId, userId));
    await tx.delete(s.participations).where(eq(s.participations.userId, userId));
    await tx.delete(s.vouchers).where(eq(s.vouchers.userId, userId));
    await tx.delete(s.userBadgeLevels).where(eq(s.userBadgeLevels.userId, userId));
    await tx.delete(s.xpEvents).where(eq(s.xpEvents.userId, userId));
    await tx.delete(s.streaks).where(eq(s.streaks.userId, userId));
    await tx.delete(s.activityDays).where(eq(s.activityDays.userId, userId));
    await tx.delete(s.notifications).where(eq(s.notifications.userId, userId));
    await tx.delete(s.linkedSocialAccounts).where(eq(s.linkedSocialAccounts.userId, userId));
    await tx.update(s.users).set({ xp: 0 }).where(eq(s.users.id, userId));
  });
}

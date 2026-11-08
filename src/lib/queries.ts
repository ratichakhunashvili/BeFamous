// Read-only database queries used by pages (server only).
import "server-only";
import { and, asc, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const { challenges, participations, missions, missionProgress, interests, userInterests, challengeLevels } = schema;

export async function getInterests() {
  return db.select().from(interests).orderBy(asc(interests.sortOrder));
}

export async function getUserInterestIds(userId: string) {
  const rows = await db.select({ id: userInterests.interestId }).from(userInterests).where(eq(userInterests.userId, userId));
  return rows.map((r) => r.id);
}

/** Public challenges (active or scheduled), with participant counts. Optional filters by interest slugs and text. */
export async function listChallenges(opts: { interestSlugs?: string[]; q?: string; city?: string } = {}) {
  const filters = [inArray(challenges.status, ["active", "scheduled"])];
  if (opts.interestSlugs?.length) {
    const ids = await db.select({ id: interests.id }).from(interests).where(inArray(interests.slug, opts.interestSlugs));
    filters.push(inArray(challenges.interestId, ids.length ? ids.map((i) => i.id) : ["00000000-0000-0000-0000-000000000000"]));
  }
  if (opts.q) {
    const like = `%${opts.q}%`;
    filters.push(or(ilike(challenges.titleKa, like), ilike(challenges.titleEn, like), ilike(challenges.brand, like))!);
  }
  if (opts.city) filters.push(eq(challenges.city, opts.city));

  return db
    .select({
      challenge: challenges,
      interestSlug: interests.slug,
      participants: sql<number>`(select count(*)::int from ${participations} p where p.challenge_id = ${challenges.id})`,
    })
    .from(challenges)
    .leftJoin(interests, eq(interests.id, challenges.interestId))
    .where(and(...filters))
    .orderBy(asc(challenges.sortOrder), asc(challenges.createdAt));
}

export async function getChallengeBySlug(slug: string) {
  const challenge = await db.query.challenges.findFirst({ where: eq(challenges.slug, slug) });
  if (!challenge) return null;
  const [{ value: participants }] = await db.select({ value: count() }).from(participations).where(eq(participations.challengeId, challenge.id));
  const levels = await db.select().from(challengeLevels).where(eq(challengeLevels.challengeId, challenge.id)).orderBy(asc(challengeLevels.position));
  const missionRows = await db.select().from(missions).where(eq(missions.challengeId, challenge.id)).orderBy(asc(missions.position));
  return { challenge, participants, levels, missions: missionRows };
}

export async function getParticipation(userId: string, challengeId: string) {
  return db.query.participations.findFirst({
    where: and(eq(participations.userId, userId), eq(participations.challengeId, challengeId)),
  });
}

/** Missions of a challenge with this user's progress status for each. */
export async function getMissionsWithProgress(userId: string, challengeId: string) {
  return db
    .select({ mission: missions, status: missionProgress.status })
    .from(missions)
    .leftJoin(missionProgress, and(eq(missionProgress.missionId, missions.id), eq(missionProgress.userId, userId)))
    .where(eq(missions.challengeId, challengeId))
    .orderBy(asc(missions.position));
}

// Campaign (= challenge) data for the admin: one campaign with missions, reward and counts,
// wizard step completeness, and automatic scheduled → active → ended status changes.
import "server-only";
import { and, asc, count, countDistinct, eq, inArray, isNotNull, lte } from "drizzle-orm";
import { db, schema } from "@/db";

const { challenges, missions, participations, checkins, qrCodes, rewards } = schema;

/**
 * Scheduled campaigns start on their start date and active ones end after their end date.
 * Called from pages that list campaigns, so no background job is needed.
 */
export async function syncChallengeStatuses() {
  const now = new Date();
  await db.update(challenges).set({ status: "active" }).where(and(eq(challenges.status, "scheduled"), isNotNull(challenges.startsAt), lte(challenges.startsAt, now)));
  await db.update(challenges).set({ status: "ended" }).where(and(inArray(challenges.status, ["active", "paused"]), isNotNull(challenges.endsAt), lte(challenges.endsAt, now)));
}

/** Participants and QR visits per campaign. */
export async function campaignCounts(ids: string[]) {
  if (!ids.length) return new Map<string, { joined: number; visits: number }>();
  const [joined, visits] = await Promise.all([
    db.select({ id: participations.challengeId, n: count() }).from(participations).where(inArray(participations.challengeId, ids)).groupBy(participations.challengeId),
    db
      .select({ id: missions.challengeId, n: countDistinct(checkins.id) })
      .from(checkins)
      .innerJoin(qrCodes, eq(qrCodes.id, checkins.qrCodeId))
      .innerJoin(missions, eq(missions.id, qrCodes.missionId))
      .where(inArray(missions.challengeId, ids))
      .groupBy(missions.challengeId),
  ]);
  return new Map(ids.map((id) => [id, { joined: joined.find((r) => r.id === id)?.n ?? 0, visits: visits.find((r) => r.id === id)?.n ?? 0 }]));
}

export async function getCampaign(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const challenge = await db.query.challenges.findFirst({ where: eq(challenges.id, id) });
  if (!challenge) return null;
  const [missionRows, reward, counts, qr] = await Promise.all([
    db.select().from(missions).where(eq(missions.challengeId, id)).orderBy(asc(missions.position)),
    db.query.rewards.findFirst({ where: eq(rewards.challengeId, id) }),
    campaignCounts([id]),
    db
      .select({ missionId: qrCodes.missionId, code: qrCodes.code })
      .from(qrCodes)
      .innerJoin(missions, eq(missions.id, qrCodes.missionId))
      .where(and(eq(missions.challengeId, id), eq(qrCodes.active, true))),
  ]);
  const c = counts.get(id) ?? { joined: 0, visits: 0 };
  return { challenge, missions: missionRows, reward, joined: c.joined, visits: c.visits, qr };
}

export type Campaign = NonNullable<Awaited<ReturnType<typeof getCampaign>>>;

export const STEPS = ["basics", "missions", "rewards", "rules", "review"] as const;
export type Step = (typeof STEPS)[number];

/** Which wizard steps have what they need (stepper "შევსებულია"). */
export function stepDone(c: Campaign, step: Step) {
  switch (step) {
    case "basics":
      return Boolean(c.challenge.titleKa && c.challenge.titleEn && c.challenge.startsAt && c.challenge.endsAt);
    case "missions":
      return c.missions.some((m) => m.required);
    case "rewards":
      return Boolean(c.reward) || c.challenge.xpReward > 0;
    case "rules":
      return (c.challenge.rules?.length ?? 0) > 0;
    case "review":
      return c.challenge.status !== "draft";
  }
}

/** Missions can only change while nobody has joined (otherwise progress and XP would break). */
export const missionsLocked = (c: Campaign) => c.joined > 0;

/** URL-safe id from the English title, e.g. "Secret Coffee Moment" → "secret-coffee-moment". */
export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "campaign"
  );
}

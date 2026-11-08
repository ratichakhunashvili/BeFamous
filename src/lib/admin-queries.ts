// Read-only queries for the admin panel. Callers must already have checked requireAdmin/requireAdminPage.
import "server-only";
import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import { db, schema } from "@/db";

const { submissions, missions, challenges, users, checkins, qrCodes, participations } = schema;

export type WorkRow = {
  key: string;
  submissionId?: string;
  name: string;
  mission: string; // mission title (ka/en picked by caller)
  missionEn: string;
  kind: "post" | "qr";
  status: "pending" | "approved" | "revision" | "rejected" | "confirmed";
  at: Date;
};

/** 18: per challenge, every registered post (not drafts) and QR visit, newest first. */
export async function getParticipantWork(limitPerChallenge = 50) {
  const list = await db.select().from(challenges).where(ne(challenges.status, "draft")).orderBy(challenges.sortOrder);
  if (!list.length) return [];
  const ids = list.map((c) => c.id);
  const [subs, visits] = await Promise.all([
    db
      .select({ id: submissions.id, status: submissions.status, at: submissions.createdAt, name: users.name, titleKa: missions.titleKa, titleEn: missions.titleEn, challengeId: missions.challengeId })
      .from(submissions)
      .innerJoin(missions, eq(missions.id, submissions.missionId))
      .innerJoin(users, eq(users.id, submissions.userId))
      .where(and(inArray(missions.challengeId, ids), ne(submissions.status, "draft")))
      .orderBy(desc(submissions.createdAt)),
    db
      .select({ id: checkins.id, at: checkins.createdAt, name: users.name, challengeId: missions.challengeId })
      .from(checkins)
      .innerJoin(qrCodes, eq(qrCodes.id, checkins.qrCodeId))
      .innerJoin(missions, eq(missions.id, qrCodes.missionId))
      .innerJoin(users, eq(users.id, checkins.userId))
      .where(inArray(missions.challengeId, ids))
      .orderBy(desc(checkins.createdAt)),
  ]);
  return list.map((challenge) => {
    const rows: WorkRow[] = [
      ...subs
        .filter((s) => s.challengeId === challenge.id)
        .map((s) => ({ key: s.id, submissionId: s.id, name: s.name, mission: s.titleKa, missionEn: s.titleEn, kind: "post" as const, status: s.status as WorkRow["status"], at: s.at })),
      ...visits
        .filter((v) => v.challengeId === challenge.id)
        .map((v) => ({ key: v.id, name: v.name, mission: "QR ვიზიტი", missionEn: "QR visit", kind: "qr" as const, status: "confirmed" as const, at: v.at })),
    ]
      .sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1) || b.at.getTime() - a.at.getTime())
      .slice(0, limitPerChallenge);
    return { challenge, rows };
  });
}

/** 19: one submission with everything the review needs. */
export async function getSubmissionForReview(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db
    .select({ sub: submissions, mission: missions, challenge: challenges, user: { id: users.id, name: users.name } })
    .from(submissions)
    .innerJoin(missions, eq(missions.id, submissions.missionId))
    .innerJoin(challenges, eq(challenges.id, missions.challengeId))
    .innerJoin(users, eq(users.id, submissions.userId))
    .where(eq(submissions.id, id));
  if (!row) return null;
  const [post, qrMission, accounts] = await Promise.all([
    db.query.socialPosts.findFirst({ where: eq(schema.socialPosts.submissionId, id) }),
    db.query.missions.findFirst({ where: and(eq(missions.challengeId, row.challenge.id), eq(missions.type, "visit_qr")) }),
    db.select().from(schema.linkedSocialAccounts).where(eq(schema.linkedSocialAccounts.userId, row.user.id)),
  ]);
  let visited: boolean | null = null; // null = this challenge has no QR visit
  if (qrMission) {
    const [hit] = await db
      .select({ id: checkins.id })
      .from(checkins)
      .innerJoin(qrCodes, eq(qrCodes.id, checkins.qrCodeId))
      .where(and(eq(checkins.userId, row.user.id), eq(qrCodes.missionId, qrMission.id)))
      .limit(1);
    visited = Boolean(hit);
  }
  return { ...row, post, visited, accounts };
}

/** Participants who joined a challenge with a post mission but have no approved post yet (for "add found post"). */
export async function getOpenParticipations() {
  return db
    .select({ id: participations.id, name: users.name, email: users.email, titleKa: challenges.titleKa, titleEn: challenges.titleEn })
    .from(participations)
    .innerJoin(users, eq(users.id, participations.userId))
    .innerJoin(challenges, eq(challenges.id, participations.challengeId))
    .where(eq(challenges.status, "active"))
    .orderBy(desc(participations.joinedAt))
    .limit(200);
}

export async function pendingCount() {
  const [r] = await db.select({ n: count() }).from(submissions).where(eq(submissions.status, "pending"));
  return r?.n ?? 0;
}

export async function nextPendingId(exceptId?: string) {
  const rows = await db.select({ id: submissions.id }).from(submissions).where(eq(submissions.status, "pending")).orderBy(submissions.createdAt).limit(2);
  return rows.find((r) => r.id !== exceptId)?.id ?? null;
}

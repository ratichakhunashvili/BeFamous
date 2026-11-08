"use server";
// Mission actions: QR check-in (12 → 39/40) and post registration (13 → 41 → 42 → 14/15).
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { completeMission, setMissionStatus } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { fetchPreview, missingHashtags, parsePostUrl } from "@/lib/social";

const uuid = z.string().uuid();

/** Loads a mission the user may work on (they joined its challenge). */
async function loadMission(userId: string, missionId: string) {
  const mission = await db.query.missions.findFirst({ where: eq(schema.missions.id, missionId) });
  if (!mission) redirect("/home");
  const joined = await db.query.participations.findFirst({
    where: and(eq(schema.participations.userId, userId), eq(schema.participations.challengeId, mission.challengeId)),
  });
  const challenge = await db.query.challenges.findFirst({ where: eq(schema.challenges.id, mission.challengeId) });
  if (!challenge) redirect("/home");
  if (!joined) redirect(`/challenges/${challenge.slug}/join`);
  return { mission, challenge };
}

/** A QR may contain our check-in URL (…/qr/CODE) or just the code. */
function extractCode(scanned: string) {
  const s = scanned.trim();
  const fromUrl = s.match(/\/qr\/([A-Za-z0-9_-]{6,64})\/?$/)?.[1];
  return (fromUrl ?? s).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
}

// ---- 12: QR check-in ----
export async function checkinAction(form: FormData) {
  const user = await requireUser();
  const missionId = uuid.parse(form.get("missionId"));
  const { mission } = await loadMission(user.id, missionId);
  if (mission.type !== "visit_qr") redirect("/home");

  const code = extractCode(String(form.get("code") ?? ""));
  const qr = code
    ? await db.query.qrCodes.findFirst({
        where: and(eq(schema.qrCodes.code, code), eq(schema.qrCodes.missionId, missionId), eq(schema.qrCodes.active, true)),
      })
    : undefined;
  if (!qr) redirect(`/missions/${missionId}/qr/error`);

  await db.transaction(async (tx) => {
    await tx.insert(schema.checkins).values({ userId: user.id, qrCodeId: qr.id }).onConflictDoNothing();
    await completeMission(tx, user.id, missionId);
  });
  redirect(`/missions/${missionId}/qr/confirmed`);
}

// ---- 13: register a post link ----
export type PostFormState = { error?: "invalid" | "locked" | "done" } | undefined;

export async function registerPostAction(_prev: PostFormState, form: FormData): Promise<PostFormState> {
  const user = await requireUser();
  const missionId = uuid.parse(form.get("missionId"));
  const { mission } = await loadMission(user.id, missionId);
  if (mission.type !== "upload") redirect("/home");

  if (mission.unlockAfterMissionId) {
    const prereq = await db.query.missionProgress.findFirst({
      where: and(eq(schema.missionProgress.userId, user.id), eq(schema.missionProgress.missionId, mission.unlockAfterMissionId)),
    });
    if (prereq?.status !== "completed") return { error: "locked" };
  }
  const progress = await db.query.missionProgress.findFirst({
    where: and(eq(schema.missionProgress.userId, user.id), eq(schema.missionProgress.missionId, missionId)),
  });
  if (progress?.status === "completed") return { error: "done" };

  const post = parsePostUrl(String(form.get("url") ?? ""));
  if (!post) return { error: "invalid" };

  const preview = await fetchPreview(post);
  const [sub] = await db
    .insert(schema.submissions)
    .values({
      userId: user.id,
      missionId,
      mediaUrl: post.url,
      mediaType: "post",
      platform: post.platform,
      handle: preview?.author ?? post.handle,
      thumbnailUrl: preview?.thumbnailUrl ?? null,
      caption: preview?.caption ?? null,
      status: "draft",
    })
    .returning({ id: schema.submissions.id });
  redirect(`/missions/${missionId}/upload/${sub.id}`);
}

// ---- 42: verify a submitted post (from 41 "confirm" or 15 "re-check") ----
export async function verifySubmissionAction(submissionId: string): Promise<{ next: string }> {
  const user = await requireUser();
  const id = uuid.parse(submissionId);
  const sub = await db.query.submissions.findFirst({ where: and(eq(schema.submissions.id, id), eq(schema.submissions.userId, user.id)) });
  if (!sub || !["draft", "revision"].includes(sub.status)) return { next: sub ? `/submissions/${sub.id}` : "/activity" };
  const { challenge } = await loadMission(user.id, sub.missionId);

  // Refresh the caption so a fixed post passes on re-check.
  const post = parsePostUrl(sub.mediaUrl);
  const preview = post ? await fetchPreview(post) : null;
  const caption = preview?.caption ?? sub.caption;
  const missing = post?.platform === "tiktok" && caption != null ? missingHashtags(challenge.hashtags, caption) : [];

  await db.transaction(async (tx) => {
    if (missing.length) {
      await tx.update(schema.submissions).set({ status: "revision", caption, reviewNote: `missing:${missing.join(" ")}` }).where(eq(schema.submissions.id, id));
      await setMissionStatus(tx, user.id, sub.missionId, "in_progress");
    } else {
      await tx.update(schema.submissions).set({ status: "pending", caption, reviewNote: null }).where(eq(schema.submissions.id, id));
      await setMissionStatus(tx, user.id, sub.missionId, "pending_review");
    }
  });
  return { next: `/submissions/${id}` };
}

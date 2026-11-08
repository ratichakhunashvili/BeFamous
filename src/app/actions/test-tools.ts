"use server";
// ⚠️ TEMPORARY test shortcuts for test@test.com. Every action re-checks on the server that the
// signed-in user IS the test account AND local test mode is on — no client flag can unlock them.
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { completeMission, recordActivity, reviewSubmission } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { isTestAccount } from "@/lib/test-mode";
import { wipeProgress } from "@/lib/test-reset";

async function requireTestAccount() {
  const user = await requireUser();
  if (!isTestAccount(user.email)) redirect("/home");
  return user;
}

const uuid = z.string().uuid();

/** "Scan" the QR of a visit mission without a camera: same result as a valid code. */
export async function testCheckinAction(form: FormData) {
  const user = await requireTestAccount();
  const missionId = uuid.parse(form.get("missionId"));
  const mission = await db.query.missions.findFirst({ where: eq(schema.missions.id, missionId) });
  if (!mission || mission.type !== "visit_qr") redirect("/home");
  const joined = await db.query.participations.findFirst({ where: and(eq(schema.participations.userId, user.id), eq(schema.participations.challengeId, mission.challengeId)) });
  if (!joined) redirect("/home");
  const qr = await db.query.qrCodes.findFirst({ where: and(eq(schema.qrCodes.missionId, missionId), eq(schema.qrCodes.active, true)) });
  if (!qr) redirect(`/missions/${missionId}/qr/error`);
  await db.transaction(async (tx) => {
    await tx.insert(schema.checkins).values({ userId: user.id, qrCodeId: qr.id }).onConflictDoNothing();
    await completeMission(tx, user.id, missionId);
    await recordActivity(tx, user.id);
  });
  redirect(`/missions/${missionId}/qr/confirmed`);
}

/** Decide your own latest pending post as if an admin did (approve / ask changes / reject). */
export async function testDecideAction(form: FormData) {
  const user = await requireTestAccount();
  const decision = z.enum(["approved", "revision", "rejected"]).parse(form.get("decision"));
  const sub = await db.query.submissions.findFirst({
    where: and(eq(schema.submissions.userId, user.id), eq(schema.submissions.status, "pending")),
    orderBy: desc(schema.submissions.createdAt),
  });
  if (!sub) redirect("/test?msg=nopending");
  await reviewSubmission(sub.id, null, decision, decision === "approved" ? undefined : "ტესტი: შეამოწმე ჰეშთეგები და სცადე თავიდან.");
  redirect(`/submissions/${sub.id}`);
}

/** Put your latest post into a monitoring state (screens 59–64) and get the notification. */
export async function testPostStateAction(form: FormData) {
  const user = await requireTestAccount();
  const state = z.enum(["found", "unavailable", "metrics_unavailable", "refresh_failed", "expired"]).parse(form.get("state"));
  if (state === "expired") {
    await db.update(schema.linkedSocialAccounts).set({ status: "expired" }).where(eq(schema.linkedSocialAccounts.userId, user.id));
    await db.insert(schema.notifications).values({ userId: user.id, kind: "account_expired", data: { platform: "tiktok" } });
    redirect("/notifications");
  }
  if (state === "found") {
    const joined = await db.select({ id: schema.participations.challengeId }).from(schema.participations).where(eq(schema.participations.userId, user.id));
    const mission = joined.length ? await db.query.missions.findFirst({ where: and(eq(schema.missions.type, "upload"), eq(schema.missions.challengeId, joined[0].id)) }) : undefined;
    if (!mission) redirect("/test?msg=join");
    const challenge = await db.query.challenges.findFirst({ where: eq(schema.challenges.id, mission.challengeId) });
    const [post] = await db
      .insert(schema.socialPosts)
      .values({ userId: user.id, missionId: mission.id, platform: "tiktok", url: `https://www.tiktok.com/@test/video/${Date.now()}`, title: "ტესტ პოსტი", caption: `ტესტ პოსტი ${challenge?.hashtags ?? ""}`, status: "found" })
      .returning();
    await db.insert(schema.notifications).values({ userId: user.id, kind: "post_found", data: { postId: post.id } });
    redirect("/notifications");
  }
  const post = await db.query.socialPosts.findFirst({ where: eq(schema.socialPosts.userId, user.id), orderBy: desc(schema.socialPosts.createdAt) });
  if (!post) redirect("/test?msg=nopost");
  const kind = { unavailable: "post_unavailable", metrics_unavailable: "post_metrics_unavailable", refresh_failed: "post_refresh_failed" }[state];
  await db
    .update(schema.socialPosts)
    .set({ status: state, metrics: null, updatedAt: new Date(), ...(state === "refresh_failed" ? { lastSyncedAt: new Date(Date.now() - 2 * 3600_000) } : {}) })
    .where(eq(schema.socialPosts.id, post.id));
  await db.insert(schema.notifications).values({ userId: user.id, kind, data: { postId: post.id } });
  redirect("/notifications");
}

/** Start over: wipes this account's progress, posts, vouchers, badges and notifications. */
export async function testResetAction() {
  const user = await requireTestAccount();
  await wipeProgress(user.id);
  redirect("/test?msg=reset");
}

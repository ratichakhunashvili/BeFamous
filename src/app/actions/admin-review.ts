"use server";
// Admin: participant work review (19 → 38/39 → 40/41/42) and post monitoring states (59–64).
// SECURITY: every exported function starts with requireAdmin() — server actions can be called directly.
import { and, eq } from "drizzle-orm";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { reviewSubmission } from "@/lib/progress";
import { requireAdmin } from "@/lib/session";
import { parsePostUrl } from "@/lib/social";

const uuid = z.string().uuid();
const note = z.string().trim().min(3).max(500);

/** Return address after a monitoring action; only admin pages, never an outside URL. */
function backTo(form: FormData) {
  const v = String(form.get("back") ?? "");
  return /^\/admin\/[\w/-]*$/.test(v) ? v : "/admin/participants";
}

export type ReviewFormState = { error?: "note" } | undefined;

async function decide(submissionId: string, adminId: string, decision: "approved" | "revision" | "rejected", text?: string) {
  const ok = await reviewSubmission(submissionId, adminId, decision, text);
  // Already decided by someone else (or a double click): show the submission as it is now.
  redirect(ok ? `/admin/participants/${submissionId}/result?decision=${decision}` : `/admin/participants/${submissionId}`, RedirectType.replace);
}

// 19 "დამტკიცება"
export async function approveSubmissionAction(form: FormData) {
  const admin = await requireAdmin();
  await decide(uuid.parse(form.get("submissionId")), admin.id, "approved");
}

// 38 / 39 — a reason is required, the participant sees it.
export async function decideWithNoteAction(_prev: ReviewFormState, form: FormData): Promise<ReviewFormState> {
  const admin = await requireAdmin();
  const submissionId = uuid.parse(form.get("submissionId"));
  const decision = z.enum(["revision", "rejected"]).parse(form.get("decision"));
  const parsed = note.safeParse(form.get("note"));
  if (!parsed.success) return { error: "note" };
  await decide(submissionId, admin.id, decision, parsed.data);
}

// ---------- Post monitoring (drives the user's screens 59–64) ----------

const postStates = { unavailable: "post_unavailable", metrics_unavailable: "post_metrics_unavailable", refresh_failed: "post_refresh_failed" } as const;

/** Mark a registered post deleted/private (62), metrics missing (63) or update failed (64) and notify the creator. */
export async function setPostStateAction(form: FormData) {
  const admin = await requireAdmin();
  const postId = uuid.parse(form.get("postId"));
  const state = z.enum(["unavailable", "metrics_unavailable", "refresh_failed"]).parse(form.get("state"));
  const [post] = await db.update(schema.socialPosts).set({ status: state, reviewerId: admin.id, updatedAt: new Date() }).where(eq(schema.socialPosts.id, postId)).returning();
  if (post) {
    await db.insert(schema.notifications).values({ userId: post.userId, kind: postStates[state], data: { postId } });
    await db.insert(schema.auditLog).values({ actorId: admin.id, action: `post.${state}`, target: postId });
  }
  redirect(backTo(form), RedirectType.replace);
}

/** Enter views/likes/comments by hand (source "admin"). Empty = unknown, never 0. */
export async function saveMetricsAction(form: FormData) {
  const admin = await requireAdmin();
  const postId = uuid.parse(form.get("postId"));
  const num = (k: string) => {
    const v = String(form.get(k) ?? "").trim();
    if (v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 && n < 1e12 ? n : null;
  };
  const metrics = { views: num("views"), likes: num("likes"), comments: num("comments") };
  const known = Object.values(metrics).some((v) => v != null);
  const post = await db.query.socialPosts.findFirst({ where: eq(schema.socialPosts.id, postId) });
  if (post) {
    await db
      .update(schema.socialPosts)
      .set({
        metrics: known ? metrics : null,
        metricsSource: known ? "admin" : null,
        lastSyncedAt: known ? new Date() : post.lastSyncedAt,
        // Numbers arrived: a post flagged "metrics unavailable / update failed" is fine again.
        status: known && (post.status === "metrics_unavailable" || post.status === "refresh_failed") ? "verified" : post.status,
        reviewerId: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.socialPosts.id, postId));
    await db.insert(schema.auditLog).values({ actorId: admin.id, action: "post.metrics", target: postId, data: metrics });
  }
  redirect(backTo(form), RedirectType.replace);
}

/** Flag a creator's linked account as needing reconnection (61). */
export async function flagAccountExpiredAction(form: FormData) {
  const admin = await requireAdmin();
  const userId = uuid.parse(form.get("userId"));
  const platform = z.enum(["tiktok", "instagram"]).parse(form.get("platform"));
  const [acc] = await db
    .update(schema.linkedSocialAccounts)
    .set({ status: "expired" })
    .where(and(eq(schema.linkedSocialAccounts.userId, userId), eq(schema.linkedSocialAccounts.platform, platform)))
    .returning();
  if (acc) {
    await db.insert(schema.notifications).values({ userId, kind: "account_expired", data: { platform } });
    await db.insert(schema.auditLog).values({ actorId: admin.id, action: "account.expired", target: acc.id });
  }
  redirect(backTo(form), RedirectType.replace);
}

export type FoundPostState = { error?: "url" | "participant" } | undefined;

/** An admin found a post by hashtag: offer it to the participant to confirm (59). */
export async function addFoundPostAction(_prev: FoundPostState, form: FormData): Promise<FoundPostState> {
  const admin = await requireAdmin();
  const participationId = uuid.safeParse(form.get("participationId"));
  if (!participationId.success) return { error: "participant" };
  const post = parsePostUrl(String(form.get("url") ?? ""));
  if (!post) return { error: "url" };
  const part = await db.query.participations.findFirst({ where: eq(schema.participations.id, participationId.data) });
  const mission = part && (await db.query.missions.findFirst({ where: and(eq(schema.missions.challengeId, part.challengeId), eq(schema.missions.type, "upload")) }));
  if (!part || !mission) return { error: "participant" };
  const caption = String(form.get("caption") ?? "").trim().slice(0, 2000) || null;
  const [row] = await db
    .insert(schema.socialPosts)
    .values({
      userId: part.userId,
      missionId: mission.id,
      platform: post.platform,
      url: post.url,
      caption,
      title: caption?.replace(/#[\p{L}\p{N}_]+/gu, "").trim().slice(0, 40) || null,
      status: "found",
      reviewerId: admin.id,
    })
    .returning({ id: schema.socialPosts.id });
  await db.insert(schema.notifications).values({ userId: part.userId, kind: "post_found", data: { postId: row.id } });
  await db.insert(schema.auditLog).values({ actorId: admin.id, action: "post.found", target: row.id });
  redirect("/admin/participants?found=1", RedirectType.replace);
}

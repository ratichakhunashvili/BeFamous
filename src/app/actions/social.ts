"use server";
// Social accounts and post verification (56, 57, 59, 66).
// There is no TikTok/Instagram login yet: "connecting" saves the user's public handle, and the
// admin compares it with the author of each registered post.
import { and, eq } from "drizzle-orm";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { recordActivity, setMissionStatus } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { missingHashtags } from "@/lib/social";

const platformSchema = z.enum(["tiktok", "instagram"]);
const uuid = z.string().uuid();

export type HandleFormState = { error?: "handle"; value?: string } | undefined;

/** Optional mission context carried through 13 → 56 → 57 so the user can return to their mission. */
const withMission = (path: string, missionId: string | null) => (missionId ? `${path}?mission=${missionId}` : path);

// ---- 56 → handle form → 57 ----
export async function connectAccountAction(_prev: HandleFormState, form: FormData): Promise<HandleFormState> {
  const user = await requireUser();
  const platform = platformSchema.parse(form.get("platform"));
  const missionId = uuid.safeParse(form.get("missionId")).data ?? null;
  const typed = String(form.get("handle") ?? "");
  const raw = typed.trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9._]{2,30}$/.test(raw)) return { error: "handle", value: typed };
  const handle = `@${raw.toLowerCase()}`;

  await db
    .insert(schema.linkedSocialAccounts)
    .values({ userId: user.id, platform, handle, status: "connected" })
    .onConflictDoUpdate({ target: [schema.linkedSocialAccounts.userId, schema.linkedSocialAccounts.platform], set: { handle, status: "connected" } });
  // Only the posts flow needs a mission; from settings (66) go back to the accounts list.
  redirect(missionId ? withMission(`/accounts/${platform}/posts`, missionId) : "/settings/accounts", RedirectType.replace);
}

// ---- 57: register one of the listed posts for the mission ----
export async function pickPostAction(form: FormData) {
  const user = await requireUser();
  const postId = uuid.parse(form.get("postId"));
  const missionId = uuid.parse(form.get("missionId"));
  const post = await db.query.socialPosts.findFirst({ where: and(eq(schema.socialPosts.id, postId), eq(schema.socialPosts.userId, user.id)) });
  if (!post || post.missionId !== missionId) redirect("/activity");
  if (post.submissionId) redirect(`/submissions/${post.submissionId}`);

  const mission = await db.query.missions.findFirst({ where: eq(schema.missions.id, missionId) });
  const challenge = mission && (await db.query.challenges.findFirst({ where: eq(schema.challenges.id, mission.challengeId) }));
  if (!mission || !challenge) redirect("/activity");
  const missing = missingHashtags(challenge.hashtags, post.caption);

  const [sub] = await db
    .insert(schema.submissions)
    .values({
      userId: user.id,
      missionId,
      mediaUrl: post.url,
      mediaType: "post",
      platform: post.platform,
      caption: post.caption,
      status: missing.length ? "revision" : "draft",
      reviewNote: missing.length ? `missing:${missing.join(" ")}` : null,
    })
    .returning({ id: schema.submissions.id });
  await db.update(schema.socialPosts).set({ submissionId: sub.id, updatedAt: new Date() }).where(eq(schema.socialPosts.id, post.id));
  // Eligible → 41 (preview + confirm); hashtag missing → 15.
  redirect(missing.length ? `/submissions/${sub.id}` : `/missions/${missionId}/upload/${sub.id}`);
}

// ---- 59: "ეს ჩემი პოსტია" / "ჩემი არ არის" ----
/** Confirming a found post registers it as the mission's submission, so the normal review applies (60 → 14/15/16). */
export async function confirmPostAction(form: FormData) {
  const user = await requireUser();
  const postId = uuid.parse(form.get("postId"));
  const post = await db.query.socialPosts.findFirst({ where: and(eq(schema.socialPosts.id, postId), eq(schema.socialPosts.userId, user.id)) });
  if (!post || post.status !== "found") redirect(`/posts/${postId}`, RedirectType.replace);

  const mission = await db.query.missions.findFirst({ where: eq(schema.missions.id, post.missionId) });
  const challenge = mission && (await db.query.challenges.findFirst({ where: eq(schema.challenges.id, mission.challengeId) }));
  const progress = await db.query.missionProgress.findFirst({ where: and(eq(schema.missionProgress.userId, user.id), eq(schema.missionProgress.missionId, post.missionId)) });
  const missing = missingHashtags(challenge?.hashtags, post.caption);

  await db.transaction(async (tx) => {
    let submissionId = post.submissionId;
    if (!submissionId && progress?.status !== "completed") {
      const [sub] = await tx
        .insert(schema.submissions)
        .values({
          userId: user.id,
          missionId: post.missionId,
          mediaUrl: post.url,
          mediaType: "post",
          platform: post.platform,
          caption: post.caption,
          status: missing.length ? "revision" : "pending",
          reviewNote: missing.length ? `missing:${missing.join(" ")}` : null,
        })
        .returning({ id: schema.submissions.id });
      submissionId = sub.id;
      await setMissionStatus(tx, user.id, post.missionId, missing.length ? "in_progress" : "pending_review");
      await recordActivity(tx, user.id);
    }
    await tx.update(schema.socialPosts).set({ status: "ownership_check", submissionId, updatedAt: new Date() }).where(eq(schema.socialPosts.id, post.id));
  });
  redirect(`/posts/${postId}`, RedirectType.replace);
}

export async function dismissPostAction(form: FormData) {
  const user = await requireUser();
  const postId = uuid.parse(form.get("postId"));
  await db
    .update(schema.socialPosts)
    .set({ status: "dismissed", updatedAt: new Date() })
    .where(and(eq(schema.socialPosts.id, postId), eq(schema.socialPosts.userId, user.id), eq(schema.socialPosts.status, "found")));
  redirect("/notifications", RedirectType.replace);
}

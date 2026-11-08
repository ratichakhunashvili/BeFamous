// Development helper until the admin panel (Phase 6): put a user's post into a verification state
// and send the matching notification, so screens 59–64 can be tried.
//   npm run dev:post -- found        # admin found a possible post (59) — needs a joined video/upload mission
//   npm run dev:post -- unavailable  # latest post deleted/private (62)
//   npm run dev:post -- metrics      # platform gave no views/likes (63)
//   npm run dev:post -- refresh      # metrics update failed (64)
//   npm run dev:post -- expired      # TikTok connection needs reconnecting (61)
// Optional 2nd argument: user email (default TEST_USER_EMAIL).
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const [state, emailArg] = process.argv.slice(2);
  const email = (emailArg ?? process.env.TEST_USER_EMAIL ?? "").toLowerCase();
  const { and, desc, eq, inArray } = await import("drizzle-orm");
  const { db, schema } = await import("../src/db");

  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user) throw new Error(`No user ${email}`);

  if (state === "expired") {
    const [acc] = await db
      .update(schema.linkedSocialAccounts)
      .set({ status: "expired" })
      .where(and(eq(schema.linkedSocialAccounts.userId, user.id), eq(schema.linkedSocialAccounts.platform, "tiktok")))
      .returning();
    if (!acc) throw new Error("User has no linked TikTok account — connect one on 56 first");
    await db.insert(schema.notifications).values({ userId: user.id, kind: "account_expired", data: { platform: "tiktok" } });
    console.log(`TikTok ${acc.handle} marked expired`);
    process.exit(0);
  }

  if (state === "found") {
    const joined = await db.select({ id: schema.participations.challengeId }).from(schema.participations).where(eq(schema.participations.userId, user.id));
    const mission = joined.length
      ? await db.query.missions.findFirst({ where: and(eq(schema.missions.type, "upload"), inArray(schema.missions.challengeId, joined.map((j) => j.id))) })
      : undefined;
    if (!mission) throw new Error("User has not joined a challenge with a post mission");
    const challenge = await db.query.challenges.findFirst({ where: eq(schema.challenges.id, mission.challengeId) });
    const [post] = await db
      .insert(schema.socialPosts)
      .values({
        userId: user.id,
        missionId: mission.id,
        platform: "tiktok",
        url: `https://www.tiktok.com/@creator/video/${Date.now()}`,
        title: "ჩემი ყავის დილა",
        caption: `ჩემი ყავის დილა ${challenge?.hashtags ?? ""}`.trim(),
        publishedAt: new Date(),
        status: "found",
      })
      .returning();
    await db.insert(schema.notifications).values({ userId: user.id, kind: "post_found", data: { postId: post.id } });
    console.log(`found: /posts/${post.id}`);
    process.exit(0);
  }

  const map = {
    unavailable: ["unavailable", "post_unavailable"],
    metrics: ["metrics_unavailable", "post_metrics_unavailable"],
    refresh: ["refresh_failed", "post_refresh_failed"],
  } as const;
  if (!(state in map)) throw new Error("Usage: found | unavailable | metrics | refresh | expired [email]");
  const [status, kind] = map[state as keyof typeof map];
  const post = await db.query.socialPosts.findFirst({ where: eq(schema.socialPosts.userId, user.id), orderBy: desc(schema.socialPosts.createdAt) });
  if (!post) throw new Error("User has no registered posts yet");
  await db
    .update(schema.socialPosts)
    .set({ status, metrics: null, updatedAt: new Date(), ...(state === "refresh" ? { lastSyncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) } : {}) })
    .where(eq(schema.socialPosts.id, post.id));
  await db.insert(schema.notifications).values({ userId: user.id, kind, data: { postId: post.id } });
  console.log(`${status}: /posts/${post.id}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

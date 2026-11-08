// Integration tests for the rules that protect data. They run ONLY against TEST_DATABASE_URL
// (the Neon branch "tests"), never the real database. Run: npm run test:db
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

if (!process.env.TEST_DATABASE_URL) {
  console.log("TEST_DATABASE_URL not set — skipping database tests.");
  process.exit(0);
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const { and, eq } = await import("drizzle-orm");
const { db, schema } = await import("../src/db");
const { reviewSubmission, setMissionStatus, issueChallengeReward } = await import("../src/lib/progress");
const { allowAttempt } = await import("../src/lib/rate-limit");

const tag = `t${Date.now()}`;
let userId = "";
let challengeId = "";
let missionId = "";

before(async () => {
  const [u] = await db.insert(schema.users).values({ name: "Test", email: `${tag}@test.invalid`, passwordHash: "x" }).returning();
  userId = u.id;
  const [c] = await db.insert(schema.challenges).values({ slug: tag, titleKa: tag, titleEn: tag, status: "active", xpReward: 100 }).returning();
  challengeId = c.id;
  const [m] = await db.insert(schema.missions).values({ challengeId, type: "upload", titleKa: "post", titleEn: "post", xpReward: 50, required: true }).returning();
  missionId = m.id;
  await db.insert(schema.participations).values({ userId, challengeId });
  await db.insert(schema.rewards).values({ titleKa: "v", titleEn: "v", valueGel: 5, stock: 10, challengeId });
});

after(async () => {
  await db.delete(schema.rewards).where(eq(schema.rewards.challengeId, challengeId));
  await db.delete(schema.challenges).where(eq(schema.challenges.id, challengeId));
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await db.delete(schema.rateLimits).where(eq(schema.rateLimits.key, `test:${tag}`));
});

describe("review", () => {
  it("a submission is decided only once, even with two admins at the same moment", async () => {
    const [s] = await db.insert(schema.submissions).values({ userId, missionId, mediaUrl: "https://www.tiktok.com/@a/video/1", mediaType: "post", status: "pending" }).returning();
    const results = await Promise.all([reviewSubmission(s.id, null, "approved"), reviewSubmission(s.id, null, "approved")]);
    assert.equal(results.filter(Boolean).length, 1);
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    // 50 mission + 100 challenge, awarded once (badges for this test interest-less challenge add nothing).
    assert.equal(user?.xp, 150);
  });

  it("a completed mission is never set back (no XP twice)", async () => {
    await db.transaction((tx) => setMissionStatus(tx, userId, missionId, "pending_review"));
    const p = await db.query.missionProgress.findFirst({ where: and(eq(schema.missionProgress.userId, userId), eq(schema.missionProgress.missionId, missionId)) });
    assert.equal(p?.status, "completed");
  });

  it("the challenge reward is issued once per person", async () => {
    await db.transaction((tx) => issueChallengeReward(tx, userId, challengeId));
    const vouchers = await db.select().from(schema.vouchers).where(eq(schema.vouchers.userId, userId));
    assert.equal(vouchers.length, 1);
    assert.match(vouchers[0].code, /^BF–5–[A-Z2-9]{4}$/);
  });
});

describe("rate limit", () => {
  it("blocks after the limit within the window", async () => {
    const key = `test:${tag}`;
    assert.equal(await allowAttempt(key, 2, 60), true);
    assert.equal(await allowAttempt(key, 2, 60), true);
    assert.equal(await allowAttempt(key, 2, 60), false);
  });
});

after(() => setTimeout(() => process.exit(0), 100)); // close the DB pool

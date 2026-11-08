// One-off: give badges/vouchers to users who completed challenges before these rules existed.
// npm run backfill
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { isNotNull } = await import("drizzle-orm");
  const { db, schema } = await import("../src/db");
  const { evaluateBadges, issueChallengeReward } = await import("../src/lib/progress");
  const done = await db.select().from(schema.participations).where(isNotNull(schema.participations.completedAt));
  for (const p of done) {
    await db.transaction(async (tx) => {
      await issueChallengeReward(tx, p.userId, p.challengeId);
      await evaluateBadges(tx, p.userId);
    });
  }
  console.log(`Checked ${done.length} completed participations`);
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

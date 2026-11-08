// ⚠️ TEMPORARY: creates (or resets) the test account test@test.com / test123 — a user AND an admin
// (the owner chose full admin access for it, also on the live site).
//   npm run dev:test-user          create or update the account (all interests, Tbilisi)
//   npm run dev:test-user -- reset also wipe its progress, posts, vouchers and notifications
// Signing in with it only works locally with ENABLE_TEST_USER=true (see src/lib/test-mode.ts).
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const reset = process.argv.includes("reset");
  const bcrypt = (await import("bcryptjs")).default;
  const { eq } = await import("drizzle-orm");
  const { db, schema } = await import("../src/db");
  const { TEST_ACCOUNT } = await import("../src/lib/test-mode");
  const { wipeProgress } = await import("../src/lib/test-reset");

  const passwordHash = await bcrypt.hash(TEST_ACCOUNT.password, 12);
  const [user] = await db
    .insert(schema.users)
    .values({ name: TEST_ACCOUNT.name, email: TEST_ACCOUNT.email, passwordHash, role: "admin", city: "tbilisi", termsAcceptedAt: new Date() })
    .onConflictDoUpdate({ target: schema.users.email, set: { passwordHash, deletedAt: null, role: "admin", name: TEST_ACCOUNT.name } })
    .returning();
  const interests = await db.select({ id: schema.interests.id }).from(schema.interests);
  await db.delete(schema.userInterests).where(eq(schema.userInterests.userId, user.id));
  if (interests.length) await db.insert(schema.userInterests).values(interests.map((i) => ({ userId: user.id, interestId: i.id })));
  if (reset) await wipeProgress(user.id);
  console.log(`${TEST_ACCOUNT.email} ready${reset ? " (progress wiped)" : ""}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

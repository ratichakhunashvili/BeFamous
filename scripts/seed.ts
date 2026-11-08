// Seeds the admin account (from .env.local) and the starter content (interests, challenges, missions).
// Safe to run repeatedly: existing rows are updated, missions are only created once per challenge.
// Run with: npm run db:seed
import { config } from "dotenv";
config({ path: ".env.local" });

import { randomBytes } from "node:crypto";
import { Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import { challengeSeed, interestSeed, rulesFor } from "./seed-data";

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Admin
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(schema.users)
    .values({ name: "Admin", email, passwordHash, role: "admin", termsAcceptedAt: new Date() })
    .onConflictDoUpdate({ target: schema.users.email, set: { role: "admin", passwordHash } });
  console.log(`Admin ready: ${email}`);

  // Interests
  const interestIds: Record<string, string> = {};
  for (const i of interestSeed) {
    const [row] = await db.insert(schema.interests).values(i).onConflictDoUpdate({ target: schema.interests.slug, set: i }).returning({ id: schema.interests.id });
    interestIds[i.slug] = row.id;
  }
  console.log(`Interests: ${interestSeed.length}`);

  // Challenges + missions
  for (const c of challengeSeed) {
    const { missions, interest, ...fields } = c;
    const values = { ...fields, interestId: interestIds[interest], status: "active" as const, rules: rulesFor(c.hashtags) };
    const [row] = await db.insert(schema.challenges).values(values).onConflictDoUpdate({ target: schema.challenges.slug, set: values }).returning({ id: schema.challenges.id });

    const existing = await db.select({ id: schema.missions.id }).from(schema.missions).where(eq(schema.missions.challengeId, row.id));
    if (existing.length === 0) {
      const idsByKey: Record<string, string> = {};
      for (const [index, m] of missions.entries()) {
        const { key, unlockAfter, ...mission } = m as typeof m & { unlockAfter?: string };
        const [inserted] = await db
          .insert(schema.missions)
          .values({ ...mission, challengeId: row.id, position: index + 1, unlockAfterMissionId: unlockAfter ? idsByKey[unlockAfter] : null })
          .returning({ id: schema.missions.id });
        idsByKey[key] = inserted.id;
      }
    }
  }
  console.log(`Challenges: ${challengeSeed.length}`);

  // One QR code per visit mission (admins create more in the admin panel).
  const visitMissions = await db.select({ id: schema.missions.id }).from(schema.missions).where(eq(schema.missions.type, "visit_qr"));
  for (const m of visitMissions) {
    const has = await db.query.qrCodes.findFirst({ where: eq(schema.qrCodes.missionId, m.id) });
    if (has) continue;
    const code = `CAFE-${randomBytes(4).toString("hex").toUpperCase()}`;
    await db.insert(schema.qrCodes).values({ missionId: m.id, code, label: "ქარხანა Coffee — სალარო" });
    console.log(`QR code created (dev): /qr/${code}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

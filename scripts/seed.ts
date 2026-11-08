// Creates (or updates) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env.local.
// Run with: npm run db:seed
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insert(schema.users)
    .values({ name: "Admin", email, passwordHash, role: "admin", termsAcceptedAt: new Date() })
    .onConflictDoUpdate({ target: schema.users.email, set: { role: "admin", passwordHash } });

  console.log(`Admin ready: ${email}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

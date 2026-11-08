// Development helper until the admin panel (Phase 6): review the latest submitted post.
//   npm run dev:review -- approve
//   npm run dev:review -- revision "აღწერას აკლია ბრენდის მონიშვნა."
//   npm run dev:review -- reject "პოსტი არ არის საჯარო."
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const [decision, note] = process.argv.slice(2);
  const map = { approve: "approved", revision: "revision", reject: "rejected" } as const;
  if (!(decision in map)) throw new Error("Usage: approve | revision <note> | reject <note>");

  const { desc, eq } = await import("drizzle-orm");
  const { db, schema } = await import("../src/db");
  const { reviewSubmission } = await import("../src/lib/progress");

  const sub = await db.query.submissions.findFirst({ where: eq(schema.submissions.status, "pending"), orderBy: desc(schema.submissions.createdAt) });
  if (!sub) throw new Error("No pending submission");
  await reviewSubmission(sub.id, null, map[decision as keyof typeof map], note);
  console.log(`${map[decision as keyof typeof map]}: ${sub.id} (${sub.mediaUrl})`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

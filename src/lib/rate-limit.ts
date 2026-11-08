// Simple fixed-window attempt limiter stored in Postgres (works with several server instances).
// Used to slow down password guessing and reset-email spam.
import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db, schema } from "@/db";

/** Counts one attempt for `key`; returns false when more than `limit` happened in the last `windowSec`. */
export async function allowAttempt(key: string, limit: number, windowSec: number) {
  const t = schema.rateLimits;
  const [row] = await db
    .insert(t)
    .values({ key, count: 1, windowStart: new Date() })
    .onConflictDoUpdate({
      target: t.key,
      // A new window starts once the old one has passed; otherwise add one.
      set: {
        count: sql`case when ${t.windowStart} < now() - make_interval(secs => ${windowSec}) then 1 else ${t.count} + 1 end`,
        windowStart: sql`case when ${t.windowStart} < now() - make_interval(secs => ${windowSec}) then now() else ${t.windowStart} end`,
      },
    })
    .returning({ count: t.count });
  return row.count <= limit;
}

/** Best-effort client IP (behind a proxy the first X-Forwarded-For entry). */
export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim().slice(0, 64);
}

/** Sign-in: 10 tries per email and 30 per IP every 15 minutes. */
export async function allowSignin(email: string) {
  const ip = await clientIp();
  const [byEmail, byIp] = await Promise.all([allowAttempt(`signin:email:${email}`, 10, 900), allowAttempt(`signin:ip:${ip}`, 30, 900)]);
  return byEmail && byIp;
}

/** Reset emails: 3 per address and 10 per IP per hour. Sign-ups: 10 per IP per hour. */
export async function allowReset(email: string) {
  const ip = await clientIp();
  const [byEmail, byIp] = await Promise.all([allowAttempt(`reset:email:${email}`, 3, 3600), allowAttempt(`reset:ip:${ip}`, 10, 3600)]);
  return byEmail && byIp;
}

export async function allowSignup() {
  return allowAttempt(`signup:ip:${await clientIp()}`, 10, 3600);
}

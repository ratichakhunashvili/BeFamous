// Loads one of the signed-in user's vouchers with its reward (server only).
import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function getMyVoucher(userId: string, voucherId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(voucherId)) return null;
  const [row] = await db
    .select({ voucher: schema.vouchers, reward: schema.rewards })
    .from(schema.vouchers)
    .innerJoin(schema.rewards, eq(schema.rewards.id, schema.vouchers.rewardId))
    .where(and(eq(schema.vouchers.id, voucherId), eq(schema.vouchers.userId, userId)));
  if (!row) return null;
  const expired = row.voucher.status === "issued" && row.voucher.expiresAt != null && row.voucher.expiresAt < new Date();
  return { ...row, expired };
}

/** Staff may type "bf-50-ab2c" or paste "BF–50–AB2C": compare in one normalised form (en dashes, upper case). */
export function normaliseVoucherCode(raw: string) {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[-‐‑‒—―−]/g, "–");
}

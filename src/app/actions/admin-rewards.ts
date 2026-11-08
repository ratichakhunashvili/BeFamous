"use server";
// Admin: rewards (22 → 45 → 46) and the counter voucher check (53).
// SECURITY: every exported function starts with requireAdmin().
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/session";

export type RewardFormState = { fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

const optionalInt = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 0 && v <= 1_000_000));

// ---- 45: create a reward ----
export async function createRewardAction(_prev: RewardFormState, form: FormData): Promise<RewardFormState> {
  const admin = await requireAdmin();
  const values = Object.fromEntries(["titleKa", "titleEn", "brand", "valueGel", "stock", "expiresAt", "challengeId"].map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = z
    .object({
      titleKa: z.string().trim().min(1).max(120),
      titleEn: z.string().trim().min(1).max(120),
      brand: z.string().trim().max(80),
      valueGel: optionalInt,
      stock: optionalInt,
      expiresAt: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        // End of that day in Tbilisi (UTC+4), and it must be in the future.
        .transform((d) => new Date(`${d}T23:59:59+04:00`))
        .refine((d) => d.getTime() > Date.now()),
      challengeId: z.string().refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v)),
    })
    .safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = "invalid";
    return { fieldErrors, values };
  }
  const d = parsed.data;
  const [row] = await db
    .insert(schema.rewards)
    .values({
      titleKa: d.titleKa,
      titleEn: d.titleEn,
      brand: d.brand || null,
      valueGel: d.valueGel,
      stock: d.stock,
      expiresAt: d.expiresAt,
      challengeId: d.challengeId || null,
    })
    .returning({ id: schema.rewards.id });
  await db.insert(schema.auditLog).values({ actorId: admin.id, action: "reward.create", target: row.id, data: { title: d.titleKa } });
  redirect(`/admin/rewards?added=${row.id}`, RedirectType.replace); // 46: list with the success title
}

/** Pause or resume a reward (paused rewards are not issued for completed challenges). */
export async function toggleRewardAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("rewardId"));
  const reward = await db.query.rewards.findFirst({ where: eq(schema.rewards.id, id) });
  if (reward) {
    await db.update(schema.rewards).set({ active: !reward.active }).where(eq(schema.rewards.id, id));
    await db.insert(schema.auditLog).values({ actorId: admin.id, action: reward.active ? "reward.pause" : "reward.resume", target: id });
  }
  redirect("/admin/rewards", RedirectType.replace);
}

// ---- 53: voucher check at the counter ----

export async function redeemVoucherAdminAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("voucherId"));
  // Status + expiry are checked inside the UPDATE, so it can only be used once.
  const [v] = await db
    .update(schema.vouchers)
    .set({ status: "redeemed", redeemedAt: new Date() })
    .where(and(eq(schema.vouchers.id, id), eq(schema.vouchers.status, "issued"), or(isNull(schema.vouchers.expiresAt), gt(schema.vouchers.expiresAt, new Date()))))
    .returning({ code: schema.vouchers.code });
  if (v) await db.insert(schema.auditLog).values({ actorId: admin.id, action: "voucher.redeem", target: id });
  const code = v?.code ?? String(form.get("code") ?? "");
  redirect(`/admin/rewards/check?code=${encodeURIComponent(code)}${v ? "&redeemed=1" : ""}`, RedirectType.replace);
}

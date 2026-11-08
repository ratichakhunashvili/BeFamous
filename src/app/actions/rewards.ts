"use server";
// 67: the user confirms the voucher was accepted at the counter. One-time and irreversible.
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/session";

export async function redeemVoucherAction(form: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().parse(form.get("voucherId"));
  // The status check is inside the UPDATE, so two quick taps can't redeem twice.
  await db
    .update(schema.vouchers)
    .set({ status: "redeemed", redeemedAt: new Date() })
    .where(
      and(
        eq(schema.vouchers.id, id),
        eq(schema.vouchers.userId, user.id),
        eq(schema.vouchers.status, "issued"),
        or(isNull(schema.vouchers.expiresAt), gt(schema.vouchers.expiresAt, new Date())),
      ),
    );
  redirect(`/rewards/${id}/used`);
}

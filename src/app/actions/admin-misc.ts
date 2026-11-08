"use server";
// Admin: team & access (54), admin's own settings (23 → 47), winners (48 → 49).
// SECURITY: every exported function starts with requireAdmin().
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/session";

const uuid = z.string().uuid();
export type SimpleState = { error?: string; values?: Record<string, string> } | undefined;

// ---------- 54: grant / revoke admin ----------
export async function grantAdminAction(_prev: SimpleState, form: FormData): Promise<SimpleState> {
  const admin = await requireAdmin();
  const email = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  if (!email.success) return { error: "email", values: { email: String(form.get("email") ?? "") } };
  const [user] = await db
    .update(schema.users)
    .set({ role: "admin" })
    .where(and(eq(schema.users.email, email.data), isNull(schema.users.deletedAt)))
    .returning({ id: schema.users.id });
  // Only existing accounts can be made admins (no pending invites).
  if (!user) return { error: "noAccount", values: { email: email.data } };
  await db.insert(schema.auditLog).values({ actorId: admin.id, action: "admin.grant", target: user.id });
  redirect("/admin/settings/access?granted=1", RedirectType.replace);
}

export async function revokeAdminAction(form: FormData) {
  const admin = await requireAdmin();
  const userId = uuid.parse(form.get("userId"));
  if (userId === admin.id) redirect("/admin/settings/access?error=self", RedirectType.replace);
  const [{ n }] = await db.select({ n: count() }).from(schema.users).where(eq(schema.users.role, "admin"));
  if (n <= 1) redirect("/admin/settings/access?error=last", RedirectType.replace);
  // Bump the session version so their open admin sessions end immediately.
  await db
    .update(schema.users)
    .set({ role: "user", sessionVersion: sql`${schema.users.sessionVersion} + 1` })
    .where(and(eq(schema.users.id, userId), eq(schema.users.role, "admin")));
  await db.insert(schema.auditLog).values({ actorId: admin.id, action: "admin.revoke", target: userId });
  redirect("/admin/settings/access", RedirectType.replace);
}

// ---------- 23 → 47: admin's own profile ----------
export async function saveAdminSettingsAction(_prev: SimpleState, form: FormData): Promise<SimpleState> {
  const admin = await requireAdmin();
  const name = z.string().trim().min(1).max(80).safeParse(form.get("name"));
  const locale = form.get("locale") === "en" ? "en" : "ka";
  if (!name.success) return { error: "name", values: { name: String(form.get("name") ?? ""), locale } };
  await db.update(schema.users).set({ name: name.data, locale }).where(eq(schema.users.id, admin.id));
  (await cookies()).set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  redirect("/admin/settings?saved=1", RedirectType.replace);
}

// ---------- 48 → 49: winners ----------
const categories = ["creative", "audience", "business"] as const;

/** 48: save the picks (one approved post per category; empty = not chosen yet). */
export async function saveWinnersAction(form: FormData) {
  const admin = await requireAdmin();
  const challengeId = uuid.parse(form.get("challengeId"));
  const existing = await db.select().from(schema.challengeWinners).where(eq(schema.challengeWinners.challengeId, challengeId));
  for (const category of categories) {
    if (existing.find((w) => w.category === category)?.confirmedAt) continue; // confirmed results don't change
    const pick = String(form.get(category) ?? "");
    const note = String(form.get(`${category}Note`) ?? "").trim().slice(0, 300) || null;
    if (!pick) {
      await db.delete(schema.challengeWinners).where(and(eq(schema.challengeWinners.challengeId, challengeId), eq(schema.challengeWinners.category, category)));
      continue;
    }
    // Must be an approved post of this campaign.
    const [sub] = await db
      .select({ id: schema.submissions.id, userId: schema.submissions.userId })
      .from(schema.submissions)
      .innerJoin(schema.missions, eq(schema.missions.id, schema.submissions.missionId))
      .where(and(eq(schema.submissions.id, uuid.parse(pick)), eq(schema.submissions.status, "approved"), eq(schema.missions.challengeId, challengeId)));
    if (!sub) continue;
    await db
      .insert(schema.challengeWinners)
      .values({ challengeId, category, userId: sub.userId, submissionId: sub.id, note, decidedBy: admin.id })
      .onConflictDoUpdate({
        target: [schema.challengeWinners.challengeId, schema.challengeWinners.category],
        set: { userId: sub.userId, submissionId: sub.id, note, decidedBy: admin.id, decidedAt: new Date() },
      });
  }
  await db.insert(schema.auditLog).values({ actorId: admin.id, action: "winners.pick", target: challengeId });
  redirect(`/admin/participants/winners/confirm?campaign=${challengeId}`, RedirectType.push);
}

/** 49: confirm the picks — they go into the history and the winners get a notification. */
export async function confirmWinnersAction(form: FormData) {
  const admin = await requireAdmin();
  const challengeId = uuid.parse(form.get("challengeId"));
  const confirmed = await db
    .update(schema.challengeWinners)
    .set({ confirmedAt: new Date() })
    .where(and(eq(schema.challengeWinners.challengeId, challengeId), isNull(schema.challengeWinners.confirmedAt)))
    .returning();
  for (const w of confirmed) {
    await db.insert(schema.notifications).values({ userId: w.userId, kind: "winner", data: { challengeId, category: w.category, submissionId: w.submissionId } });
  }
  if (confirmed.length) await db.insert(schema.auditLog).values({ actorId: admin.id, action: "winners.confirm", target: challengeId, data: confirmed.map((w) => ({ category: w.category, userId: w.userId })) });
  redirect(`/admin/participants/winners/confirm?campaign=${challengeId}&done=1`, RedirectType.replace);
}

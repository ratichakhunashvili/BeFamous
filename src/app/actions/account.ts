"use server";
// Account screens: profile edit (45), language (69), notifications (24/52), account deletion (70).
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { signOut } from "@/auth";
import { db, schema } from "@/db";
import { isCity } from "@/lib/cities";
import { notificationHref } from "@/lib/notifications";
import { requireUser } from "@/lib/session";

// ---- 45 → 46: save profile ----
export type ProfileFormState = { fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

export async function updateProfileAction(_prev: ProfileFormState, form: FormData): Promise<ProfileFormState> {
  const user = await requireUser();
  const values = { name: String(form.get("name") ?? ""), city: String(form.get("city") ?? ""), bio: String(form.get("bio") ?? "") };
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(80),
      city: z.string().refine((v) => v === "" || isCity(v)),
      bio: z.string().trim().max(160),
    })
    .safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = String(issue.path[0]);
    return { fieldErrors, values };
  }
  await db
    .update(schema.users)
    .set({ name: parsed.data.name, city: parsed.data.city || null, bio: parsed.data.bio || null })
    .where(eq(schema.users.id, user.id));
  redirect("/profile/saved", RedirectType.replace); // Back from 46 skips the form
}

// ---- 69: language ----
export async function setLocaleAction(form: FormData) {
  const locale = form.get("locale") === "en" ? "en" : "ka";
  const user = await requireUser();
  await db.update(schema.users).set({ locale }).where(eq(schema.users.id, user.id));
  (await cookies()).set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  redirect("/settings", RedirectType.replace);
}

// ---- 24 → 52: mark all read ----
export async function markAllReadAction() {
  const user = await requireUser();
  await db
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(and(eq(schema.notifications.userId, user.id), isNull(schema.notifications.readAt)));
  redirect("/notifications", RedirectType.replace);
}

// ---- 24: open one notification (marks it read, then goes to its screen) ----
export async function openNotificationAction(form: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) redirect("/notifications");
  const [row] = await db
    .update(schema.notifications)
    .set({ readAt: sql`coalesce(${schema.notifications.readAt}, now())` })
    .where(and(eq(schema.notifications.id, id.data), eq(schema.notifications.userId, user.id)))
    .returning({ kind: schema.notifications.kind, data: schema.notifications.data });
  if (!row) redirect("/notifications");
  redirect(notificationHref(row.kind, row.data as Record<string, unknown> | null));
}

// ---- 70 → 71: delete account ----
/**
 * Removes the person's data and frees their email so they can sign up again (71 "ახალი ანგარიში").
 * Posts on their own TikTok/Instagram are untouched (we never stored the videos).
 * Submissions stay as anonymous records so a business's campaign history stays consistent.
 */
export async function deleteAccountAction() {
  const user = await requireUser();
  const randomHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
  await db.transaction(async (tx) => {
    const { users, vouchers, linkedSocialAccounts, notifications, invites, socialPosts, passwordResetTokens, userInterests, xpEvents } = schema;
    await tx.delete(vouchers).where(and(eq(vouchers.userId, user.id), eq(vouchers.status, "issued")));
    await tx.delete(socialPosts).where(eq(socialPosts.userId, user.id));
    await tx.delete(linkedSocialAccounts).where(eq(linkedSocialAccounts.userId, user.id));
    await tx.delete(notifications).where(eq(notifications.userId, user.id));
    await tx.delete(invites).where(eq(invites.inviterId, user.id));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await tx.delete(userInterests).where(eq(userInterests.userId, user.id));
    await tx.delete(xpEvents).where(eq(xpEvents.userId, user.id));
    await tx
      .update(users)
      .set({
        email: `deleted-${user.id}@deleted.invalid`,
        name: "—",
        passwordHash: randomHash,
        avatarUrl: null,
        bio: null,
        city: null,
        xp: 0,
        deletedAt: new Date(),
        sessionVersion: sql`${users.sessionVersion} + 1`,
      })
      .where(eq(users.id, user.id));
  });
  await signOut({ redirect: false });
  redirect("/account-deleted", RedirectType.replace);
}

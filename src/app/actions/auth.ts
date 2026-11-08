"use server";
// Server actions for account screens. These run only on the server, so the
// database and password hashing never reach the browser.
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db, schema } from "@/db";

export type FormState = { error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8).max(200);
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

// ---- 04 Sign up ----
export async function signupAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") };
  const parsed = z
    .object({ name: z.string().trim().min(1).max(80), email, password })
    .safeParse({ ...values, password: form.get("password") });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = String(issue.path[0]);
    return { fieldErrors, values };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const inserted = await db
    .insert(schema.users)
    .values({ name: parsed.data.name, email: parsed.data.email, passwordHash, termsAcceptedAt: new Date() })
    .onConflictDoNothing({ target: schema.users.email })
    .returning({ id: schema.users.id });

  if (inserted.length === 0) return { fieldErrors: { email: "taken" }, values };

  // Log the new user straight in, then continue to interests (Figma: → interests).
  await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/interests" });
}

// ---- 03 Sign in ----
export async function signinAction(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { email: String(form.get("email") ?? "") };
  try {
    await signIn("credentials", {
      email: values.email,
      password: String(form.get("password") ?? ""),
      redirectTo: "/home",
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: "invalid", values };
    throw e; // the successful-login redirect is also thrown; let Next.js handle it
  }
}

export async function signoutAction() {
  await signOut({ redirectTo: "/" });
}

// ---- 29 Request password reset ----
export async function requestResetAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { fieldErrors: { email: "email" }, values: { email: String(form.get("email") ?? "") } };

  const user = await db.query.users.findFirst({ where: and(eq(schema.users.email, parsed.data), isNull(schema.users.deletedAt)) });
  if (user) {
    const token = randomBytes(32).toString("base64url");
    await db.insert(schema.passwordResetTokens).values({
      userId: user.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    const h = await headers();
    const origin = process.env.APP_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    const link = `${origin}/reset/${token}`;
    // Development: no email service yet, so the link is printed in the server terminal.
    console.log(`\n[password reset] ${parsed.data}\n${link}\n`);
  }
  // Same response whether or not the account exists, so nobody can probe which emails are registered.
  redirect(`/reset/sent?email=${encodeURIComponent(parsed.data)}`);
}

// ---- Set new password (from the emailed link) ----
export async function resetPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const parsed = password.safeParse(form.get("password"));
  if (!parsed.success) return { fieldErrors: { password: "password" } };

  const row = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(schema.passwordResetTokens.tokenHash, sha256(token)),
      isNull(schema.passwordResetTokens.usedAt),
      gt(schema.passwordResetTokens.expiresAt, new Date()),
    ),
  });
  if (!row) return { error: "invalidLink" };

  const passwordHash = await bcrypt.hash(parsed.data, 12);
  await db.transaction(async (tx) => {
    await tx
      .update(schema.users)
      .set({ passwordHash, sessionVersion: sql`${schema.users.sessionVersion} + 1` }) // logs out other sessions
      .where(eq(schema.users.id, row.userId));
    await tx.update(schema.passwordResetTokens).set({ usedAt: new Date() }).where(eq(schema.passwordResetTokens.id, row.id));
  });
  redirect("/signin?reset=1");
}

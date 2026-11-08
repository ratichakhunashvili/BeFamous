"use server";
// Joining challenges and saving interests. Each action checks the session itself.
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/session";

/** 05/32: replace the user's interests with the selected ones, then go home. */
export async function saveInterestsAction(form: FormData) {
  const user = await requireUser();
  const slugs = z.array(z.string().max(60)).max(50).parse(form.getAll("interest").map(String));
  const rows = slugs.length ? await db.select({ id: schema.interests.id }).from(schema.interests).where(inArray(schema.interests.slug, slugs)) : [];

  await db.transaction(async (tx) => {
    await tx.delete(schema.userInterests).where(eq(schema.userInterests.userId, user.id));
    if (rows.length) await tx.insert(schema.userInterests).values(rows.map((r) => ({ userId: user.id, interestId: r.id })));
  });
  redirect("/home");
}

/** 10/37: join a challenge (idempotent), then open its missions. */
export async function joinChallengeAction(form: FormData) {
  const user = await requireUser();
  const slug = z.string().max(120).parse(form.get("slug"));
  const challenge = await db.query.challenges.findFirst({ where: eq(schema.challenges.slug, slug) });
  if (!challenge || challenge.status !== "active") redirect(`/challenges/${slug}`);

  await db.insert(schema.participations).values({ userId: user.id, challengeId: challenge.id }).onConflictDoNothing();

  // Create "not started" progress rows so the mission list can show status per mission.
  const missionRows = await db.select({ id: schema.missions.id }).from(schema.missions).where(eq(schema.missions.challengeId, challenge.id));
  if (missionRows.length) {
    await db
      .insert(schema.missionProgress)
      .values(missionRows.map((m) => ({ userId: user.id, missionId: m.id })))
      .onConflictDoNothing();
  }
  revalidatePath(`/challenges/${slug}`);
  redirect(`/challenges/${slug}/missions`);
}

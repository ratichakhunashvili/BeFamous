// Admin 40 / 41 / 42 — result after approving, requesting changes or rejecting.
// The Figma panel heading "შესამოწმებელი" (to review) becomes the review queue: how many are left + next one.
import { and, eq, gte, inArray, sum } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminPanel, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import { nextPendingId, pendingCount } from "@/lib/admin-queries";
import { requireAdminPage } from "@/lib/session";

export default async function ResultPage({ params }: PageProps<"/admin/participants/[id]/result">) {
  await requireAdminPage();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [row] = await db
    .select({ sub: schema.submissions, challengeId: schema.missions.challengeId })
    .from(schema.submissions)
    .innerJoin(schema.missions, eq(schema.missions.id, schema.submissions.missionId))
    .where(eq(schema.submissions.id, id));
  if (!row || !["approved", "revision", "rejected"].includes(row.sub.status)) notFound();
  const { sub } = row;
  const t = await getTranslations("admin.review");
  const c = await getTranslations("admin");

  // XP this approval actually gave (mission XP + the challenge XP if it completed the challenge).
  let xp = 0;
  if (sub.status === "approved" && sub.reviewedAt) {
    const [r] = await db
      .select({ total: sum(schema.xpEvents.amount) })
      .from(schema.xpEvents)
      .where(
        and(
          eq(schema.xpEvents.userId, sub.userId),
          inArray(schema.xpEvents.refId, [sub.missionId, row.challengeId]),
          gte(schema.xpEvents.createdAt, new Date(sub.reviewedAt.getTime() - 60_000)),
        ),
      );
    xp = Number(r?.total ?? 0);
  }
  const [left, next] = await Promise.all([pendingCount(), nextPendingId(id)]);
  const key = sub.status === "approved" ? "approved" : sub.status === "revision" ? "revision" : "rejected";

  return (
    <>
      <AdminHeader crumb={c("crumb")} back="/admin/participants" />
      <AdminBody>
        <AdminTitle eyebrow={t("resultEyebrow")} title={t(`result.${key}Title`)} body={key === "approved" ? (xp > 0 ? t("result.approvedBody", { xp }) : t("result.approvedNoXp")) : t(`result.${key}Body`)} />
        <AdminPanel className="w-full max-w-[768px] gap-4 p-6">
          <h2 className="text-h2 text-text">
            {t("queue")} · {left}
          </h2>
          {next && (
            <ButtonLink href={`/admin/participants/${next}`} variant="secondary">
              {t("nextPending")}
            </ButtonLink>
          )}
          <ButtonLink href="/admin/participants">{t("backToParticipants")}</ButtonLink>
        </AdminPanel>
      </AdminBody>
    </>
  );
}

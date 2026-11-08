// Status of a registered post:
//   pending            → 14 გაგზავნილია (Figma 87:7386)
//   revision / rejected→ 15 შესწორება   (Figma 87:7453)
//   approved           → 16 დადასტურება (Figma 87:7510) when the challenge is complete
import { and, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, ResultPanel, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireUser } from "@/lib/session";

export default async function SubmissionPage({ params }: PageProps<"/submissions/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const sub = await db.query.submissions.findFirst({ where: and(eq(schema.submissions.id, id), eq(schema.submissions.userId, user.id)) });
  if (!sub) notFound();
  if (sub.status === "draft") redirect(`/missions/${sub.missionId}/upload/${sub.id}`);

  const mission = await db.query.missions.findFirst({ where: eq(schema.missions.id, sub.missionId) });
  const challenge = mission ? await db.query.challenges.findFirst({ where: eq(schema.challenges.id, mission.challengeId) }) : undefined;
  if (!mission || !challenge) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("post");
  const c = await getTranslations("common");

  const shell = (children: React.ReactNode) => (
    <Screen>
      <AppBar back="/activity" brandLabel={c("brand")} />
      <CurvesBackdrop>{children}</CurvesBackdrop>
    </Screen>
  );

  if (sub.status === "pending") {
    return shell(
      <>
        <ResultPanel icon="/figma/icon-check-26.svg" title={t("sentTitle")} body={t("sentBody")} />
        <InfoRow layout="centered" icon="/figma/icon-clock-20.svg" title={t("status")} body={t("inReview")} />
        <ButtonLink href="/activity">{t("myActivity")}</ButtonLink>
        <ButtonLink href="/discover" variant="secondary">
          {t("otherChallenges")}
        </ButtonLink>
      </>,
    );
  }

  if (sub.status === "revision" || sub.status === "rejected") {
    // System hashtag check stores "missing:#A #B"; an admin note is shown as written.
    const missing = sub.reviewNote?.startsWith("missing:") ? sub.reviewNote.slice(8) : null;
    const title = missing ? t("fixTitle") : sub.status === "rejected" ? t("rejectedTitle") : t("reviseTitle");
    const body = missing ? t("fixBody", { tags: missing }) : sub.reviewNote ?? "";
    return shell(
      <>
        <ResultPanel icon="/figma/icon-activity-26.svg" title={title} body={body} />
        {sub.status === "revision" && <ButtonLink href={`/missions/${mission.id}/upload/${sub.id}/checking`}>{t("recheck")}</ButtonLink>}
        {/* Fixed the post or posted a new one? Register the new link (13). */}
        <ButtonLink href={`/missions/${mission.id}/upload`} variant="secondary">
          {t("newLink")}
        </ButtonLink>
        <ButtonLink href="/activity" variant={sub.status === "revision" ? "secondary" : "primary"}>
          {t("myActivity")}
        </ButtonLink>
      </>,
    );
  }

  // approved
  const participation = await db.query.participations.findFirst({
    where: and(eq(schema.participations.userId, user.id), eq(schema.participations.challengeId, challenge.id)),
  });
  const completed = Boolean(participation?.completedAt);
  const xp = challenge.xpReward + mission.xpReward;
  return shell(
    <>
      <ResultPanel icon="/figma/icon-badge-26.svg" title={completed ? t("doneTitle") : t("approvedTitle")} body={completed ? t("doneBody", { xp }) : t("approvedBody")} />
      {completed && (
        <Link href="/xp" className="flex w-full flex-col gap-5 overflow-clip rounded-bf-16 border border-line bg-surface p-4 text-white transition-colors hover:bg-elevated/40">
          <span className="flex items-center gap-2">
            <Image src="/figma/icon-spark-16.svg" alt="" width={16} height={16} className="size-4" />
            <span className="text-caption">{t("earned")}</span>
          </span>
          <span className="text-center text-h2">+{xp} XP</span>
          <span className="text-center text-caption">{tr(challenge, "title", locale)}</span>
        </Link>
      )}
      <ButtonLink href={completed ? "/rewards" : `/challenges/${challenge.slug}/missions`}>{completed ? t("seeRewards") : c("back")}</ButtonLink>
      <ButtonLink href="/activity" variant="secondary">
        {t("myActivity")}
      </ButtonLink>
    </>,
  );
}

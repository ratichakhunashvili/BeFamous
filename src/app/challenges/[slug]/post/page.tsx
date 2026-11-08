// 58 ელოდება გამოქვეყნებას — Figma 300:2544. Joined a challenge, but no post registered yet.
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { StatusScreen } from "@/components/status-screen";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { getChallengeBySlug, getParticipation } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function WaitingForPostPage({ params }: PageProps<"/challenges/[slug]/post">) {
  const user = await requireUser();
  const { slug } = await params;
  const found = await getChallengeBySlug(slug);
  if (!found) notFound();
  const { challenge } = found;
  if (!(await getParticipation(user.id, challenge.id))) redirect(`/challenges/${slug}/join`);
  const mission = await db.query.missions.findFirst({ where: and(eq(schema.missions.challengeId, challenge.id), eq(schema.missions.type, "upload")) });
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("postStates");

  return (
    <StatusScreen back="/activity" icon="/figma/icon-clock-26.svg" title={t("waitingTitle")} body={t("waitingBody", { challenge: tr(challenge, "title", locale), tags: challenge.hashtags ?? "#BeFamous" })}>
      <ButtonLink href={mission ? `/missions/${mission.id}/upload` : `/challenges/${slug}/missions`}>{t("register")}</ButtonLink>
      <ButtonLink href={`/challenges/${slug}/rules`} variant="secondary">
        {t("rules")}
      </ButtonLink>
    </StatusScreen>
  );
}

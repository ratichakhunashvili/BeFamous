// 39 ვიზიტი დადასტურებულია — Figma 87:9789
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, ResultPanel, Screen, StickyBar } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function QrConfirmedPage({ params }: PageProps<"/missions/[id]/qr/confirmed">) {
  const user = await requireUser();
  const { id } = await params;
  const ctx = await getMissionContext(user.id, id);
  if (!ctx) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("qr");
  const c = await getTranslations("common");

  const requiredIds = ctx.siblings.filter((m) => m.required).map((m) => m.id);
  const done = requiredIds.length
    ? await db
        .select({ id: schema.missionProgress.missionId })
        .from(schema.missionProgress)
        .where(and(eq(schema.missionProgress.userId, user.id), eq(schema.missionProgress.status, "completed"), inArray(schema.missionProgress.missionId, requiredIds)))
    : [];
  // The next mission this visit unlocked (the video post).
  const next = await db.query.missions.findFirst({ where: eq(schema.missions.unlockAfterMissionId, id) });

  return (
    <Screen>
      <AppBar back={`/challenges/${ctx.challenge.slug}/missions`} brandLabel={c("brand")} />
      <CurvesBackdrop clearance={96}>
        <ResultPanel icon="/figma/icon-check-26.svg" title={t("okTitle")} body={t("okBody")} />
        <InfoRow layout="centered" icon="/figma/icon-check.svg" title={tr(ctx.mission, "title", locale)} body={t("okProgress", { done: done.length, total: requiredIds.length })} />
      </CurvesBackdrop>
      <StickyBar>
        <ButtonLink href={next ? `/missions/${next.id}/upload` : `/challenges/${ctx.challenge.slug}/missions`}>{t("register")}</ButtonLink>
      </StickyBar>
    </Screen>
  );
}

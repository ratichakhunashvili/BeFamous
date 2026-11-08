// 51 ბეჯის პირობა — Figma 87:10687. Explains the next level is locked (plus the exact condition).
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, ResultPanel, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireUser } from "@/lib/session";

export default async function BadgeNextPage({ params }: PageProps<"/badges/[slug]/next">) {
  const user = await requireUser();
  const { slug } = await params;
  const badge = await db.query.badges.findFirst({ where: eq(schema.badges.slug, slug) });
  if (!badge) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("badgesPage");
  const c = await getTranslations("common");

  const levels = await db.select().from(schema.badgeLevels).where(eq(schema.badgeLevels.badgeId, badge.id)).orderBy(asc(schema.badgeLevels.position));
  const earned = await db
    .select({ id: schema.userBadgeLevels.levelId })
    .from(schema.userBadgeLevels)
    .innerJoin(schema.badgeLevels, eq(schema.badgeLevels.id, schema.userBadgeLevels.levelId))
    .where(and(eq(schema.userBadgeLevels.userId, user.id), eq(schema.badgeLevels.badgeId, badge.id)));
  const next = levels.find((l) => !earned.some((e) => e.id === l.id));
  const body = next ? `${t("lockedBody")} ${t("needed", { condition: tr(next, "condition", locale) })}` : t("lockedBody");

  return (
    <Screen>
      <AppBar back={`/badges/${slug}`} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <ResultPanel icon="/figma/icon-lock-26.svg" title={t("lockedTitle")} body={body} />
        <ButtonLink href={`/badges/${slug}`}>{t("backToCollection")}</ButtonLink>
        <ButtonLink href="/discover" variant="secondary">
          {t("discover")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}

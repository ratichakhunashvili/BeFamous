// 18 ბეჯების კოლექცია — Figma 87:7713
import { asc, count, eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { BottomNav } from "@/components/nav";
import { AppBar, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireUser } from "@/lib/session";

export default async function BadgesPage() {
  await requireUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("badgesPage");
  const c = await getTranslations("common");
  const rows = await db
    .select({ badge: schema.badges, levels: count(schema.badgeLevels.id) })
    .from(schema.badges)
    .leftJoin(schema.badgeLevels, eq(schema.badgeLevels.badgeId, schema.badges.id))
    .groupBy(schema.badges.id)
    .orderBy(asc(schema.badges.sortOrder));

  return (
    <Screen>
      <AppBar back="history" brandLabel={c("brand")} />
      <CurvesBackdrop clearance={100}>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="bodyStart" />
        {rows.map(({ badge, levels }) => (
          <InfoRow
            key={badge.id}
            href={`/badges/${badge.slug}`}
            layout="centered"
            icon={badge.icon ?? "/figma/icon-badge.svg"}
            chevron="/figma/icon-chevron.svg"
            title={tr(badge, "name", locale)}
            body={`${tr(badge, "subtitle", locale)} · ${t("levels", { count: levels })}`}
          />
        ))}
      </CurvesBackdrop>
      <BottomNav active="profile" />
    </Screen>
  );
}

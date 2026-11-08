// 17 ჩემი აქტივობა — Figma 87:7580. One row per joined challenge with its current state.
import { and, desc, eq, inArray } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { BottomNav, TabTopBar } from "@/components/nav";
import { ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireUser } from "@/lib/session";

export default async function ActivityPage() {
  const user = await requireUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("activity");

  const joined = await db
    .select({ p: schema.participations, c: schema.challenges, icon: schema.interests.icon })
    .from(schema.participations)
    .innerJoin(schema.challenges, eq(schema.challenges.id, schema.participations.challengeId))
    .leftJoin(schema.interests, eq(schema.interests.id, schema.challenges.interestId))
    .where(eq(schema.participations.userId, user.id))
    .orderBy(desc(schema.participations.joinedAt));

  const missionRows = joined.length
    ? await db.select({ id: schema.missions.id, challengeId: schema.missions.challengeId }).from(schema.missions).where(inArray(schema.missions.challengeId, joined.map((j) => j.c.id)))
    : [];
  const subs = missionRows.length
    ? await db
        .select()
        .from(schema.submissions)
        .where(and(eq(schema.submissions.userId, user.id), inArray(schema.submissions.missionId, missionRows.map((m) => m.id))))
        .orderBy(desc(schema.submissions.createdAt))
    : [];

  const rows = joined.map(({ p, c, icon }) => {
    const missionIds = missionRows.filter((m) => m.challengeId === c.id).map((m) => m.id);
    const latest = subs.find((s) => missionIds.includes(s.missionId) && s.status !== "draft");
    const category = icon ?? "/figma/icon-check.svg";
    if (p.completedAt) {
      const approved = subs.find((s) => missionIds.includes(s.missionId) && s.status === "approved");
      return { c, icon: "/figma/icon-check.svg", status: `${t("approved")} · +${c.xpReward} XP`, href: approved ? `/submissions/${approved.id}` : `/challenges/${c.slug}` };
    }
    if (latest?.status === "revision" || latest?.status === "rejected") {
      const detail = latest.reviewNote?.startsWith("missing:") ? t("hashtagMissing") : t("reviewNote");
      return { c, icon: category, status: `${latest.status === "rejected" ? t("rejected") : t("needsFix")} · ${detail}`, href: `/submissions/${latest.id}` };
    }
    if (latest?.status === "pending") {
      return { c, icon: "/figma/icon-clock-20.svg", status: `${t("inReview")} · ${t("postChecking")}`, href: `/submissions/${latest.id}` };
    }
    if (c.kind === "video") {
      const tag = (c.hashtags ?? "").split(/\s+/).at(-1) ?? "";
      return { c, icon: "/figma/icon-clock-20.svg", status: `${t("waitingPost")} · ${t("hashtag", { tag })}`, href: `/challenges/${c.slug}/missions` };
    }
    return { c, icon: category, status: `${t("inProgress")} · ${t("missions")}`, href: `/challenges/${c.slug}/missions` };
  });

  return (
    <Screen>
      <TabTopBar />
      <CurvesBackdrop clearance={100}>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="bodyStart" />
        {rows.length === 0 && <p className="w-full rounded-bf-16 border border-line bg-surface p-4 text-center text-body text-white">{t("empty")}</p>}
        {rows.map((r) => (
          <InfoRow key={r.c.id} href={r.href} layout="centered" icon={r.icon} chevron="/figma/icon-chevron.svg" title={tr(r.c, "title", locale)} body={r.status} />
        ))}
        <ButtonLink href="/discover">{t("findNew")}</ButtonLink>
      </CurvesBackdrop>
      <BottomNav active="activity" />
    </Screen>
  );
}

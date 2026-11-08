// 20 XP და დონე — Figma 87:8026. Level card + recent XP history.
import { and, desc, eq, inArray } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, InfoRow, PageTitle, Panel, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { tbilisiDate, tbilisiYesterday } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { levelLabel, XP_PER_LEVEL } from "@/lib/xp";

export default async function XpPage() {
  const session = await requireUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("xpPage");
  const c = await getTranslations("common");

  const [user, events] = await Promise.all([
    db.query.users.findFirst({ where: eq(schema.users.id, session.id), columns: { xp: true } }),
    db.select().from(schema.xpEvents).where(eq(schema.xpEvents.userId, session.id)).orderBy(desc(schema.xpEvents.createdAt)).limit(10),
  ]);
  const xp = user?.xp ?? 0;
  const into = xp % XP_PER_LEVEL;
  const pct = Math.round((into / XP_PER_LEVEL) * 100);

  // Titles + links for history rows
  const refIds = events.map((e) => e.refId).filter(Boolean) as string[];
  const [challengeRows, missionRows, badgeRows, approvedSubs] = refIds.length
    ? await Promise.all([
        db.select().from(schema.challenges).where(inArray(schema.challenges.id, refIds)),
        db.select().from(schema.missions).where(inArray(schema.missions.id, refIds)),
        db.select({ id: schema.badgeLevels.id, nameKa: schema.badgeLevels.nameKa, nameEn: schema.badgeLevels.nameEn, slug: schema.badges.slug }).from(schema.badgeLevels).innerJoin(schema.badges, eq(schema.badges.id, schema.badgeLevels.badgeId)).where(inArray(schema.badgeLevels.id, refIds)),
        db.select({ id: schema.submissions.id, missionId: schema.submissions.missionId }).from(schema.submissions).where(and(eq(schema.submissions.userId, session.id), eq(schema.submissions.status, "approved"))),
      ])
    : [[], [], [], []];

  const today = tbilisiDate();
  const yesterday = tbilisiYesterday();
  const when = (d: Date) => {
    const day = tbilisiDate(d);
    if (day === today) return t("today");
    if (day === yesterday) return t("yesterday");
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", { day: "numeric", month: "long", timeZone: "Asia/Tbilisi" }).format(d);
  };

  const history = events.map((e) => {
    const ch = challengeRows.find((r) => r.id === e.refId);
    const mi = missionRows.find((r) => r.id === e.refId);
    const bl = badgeRows.find((r) => r.id === e.refId);
    const parentChallenge = ch ?? challengeRows.find((r) => r.id === mi?.challengeId);
    const sub = approvedSubs.find((s) => s.missionId === mi?.id);
    const title = ch ? tr(ch, "title", locale) : mi ? tr(mi, "title", locale) : bl ? t("reasonBadge", { name: locale === "en" ? bl.nameEn : bl.nameKa }) : t("reasonAdmin");
    const href = bl ? `/badges/${bl.slug}` : sub ? `/submissions/${sub.id}` : parentChallenge ? `/challenges/${parentChallenge.slug}` : undefined;
    return { id: e.id, title, sub: `${when(e.createdAt)}  ·  +${e.amount} XP`, href, icon: bl ? "/figma/icon-badge.svg" : "/figma/icon-coffee.svg" };
  });

  return (
    <Screen>
      <AppBar back="history" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="bodyStart" />
        <Panel className="flex w-full flex-col gap-5 p-4 text-white">
          <h2 className="text-center text-h3">{t("level", { level: levelLabel(xp) })}</h2>
          <p className="text-center text-display">{xp.toLocaleString("en-US")} XP</p>
          <div className="h-2 w-full overflow-clip rounded-full bg-elevated" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-center text-caption">{t("toNext", { xp: XP_PER_LEVEL - into })}</p>
        </Panel>
        {history.map((h) => (
          <InfoRow key={h.id} href={h.href} layout="centered" icon={h.icon} chevron={h.href ? "/figma/icon-chevron.svg" : undefined} title={h.title} body={h.sub} />
        ))}
        <InfoRow href="/badges" layout="centered" icon="/figma/icon-badge.svg" chevron="/figma/icon-chevron.svg" title={t("badges")} body={t("badgesBody")} />
      </CurvesBackdrop>
    </Screen>
  );
}

// 21 სერია — Figma 87:8119. Current streak, this week's active days, record.
import { and, eq, gte } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Panel, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import { tbilisiDate, tbilisiYesterday } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function StreakPage() {
  const user = await requireUser();
  const t = await getTranslations("streakPage");
  const c = await getTranslations("common");

  // Monday..Sunday of the current week, in Tbilisi time.
  const today = tbilisiDate();
  const [y, m, d] = today.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  const mondayOffset = (base.getUTCDay() + 6) % 7;
  const week = Array.from({ length: 7 }, (_, i) => new Date(base.getTime() + (i - mondayOffset) * 86_400_000).toISOString().slice(0, 10));

  const [streak, days] = await Promise.all([
    db.query.streaks.findFirst({ where: eq(schema.streaks.userId, user.id) }),
    db.select({ day: schema.activityDays.day }).from(schema.activityDays).where(and(eq(schema.activityDays.userId, user.id), gte(schema.activityDays.day, week[0]))),
  ]);
  const active = new Set(days.map((r) => r.day));
  // A streak only counts if the last active day was today or yesterday.
  const yesterday = tbilisiYesterday();
  const current = streak && (streak.lastActiveDate === today || streak.lastActiveDate === yesterday) ? streak.current : 0;
  const labels = t.raw("days") as string[];

  return (
    <Screen>
      <AppBar back="history" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body", { count: current })} />
        <Panel className="flex w-full flex-col gap-5 p-4 text-white">
          <h2 className="text-center text-h3">{t("inARow", { count: current })}</h2>
          <ul className="flex items-center justify-between gap-[6px]">
            {week.map((day, i) => {
              const on = active.has(day);
              return (
                <li key={day} aria-label={`${labels[i]}${on ? " ✓" : ""}`} className={`flex h-9 w-10 items-center justify-center rounded-full text-caption text-white ${on ? "bg-action" : "bg-elevated"} ${day === today ? "ring-2 ring-primary/70" : ""}`}>
                  {labels[i]}
                </li>
              );
            })}
          </ul>
          <p className="text-center text-caption">{t("record", { count: streak?.longest ?? 0 })}</p>
        </Panel>
        <InfoRow href="/badges/streak-mastery" layout="centered" icon="/figma/icon-flame-20.svg" chevron="/figma/icon-chevron.svg" title="Streak Mastery" body={t("next")} />
        <ButtonLink href="/discover">{t("find")}</ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}

// 25 პროფილი — Figma 87:8554. Identity panel + links to XP (20), streak (21), badges (18), settings (26).
import Image from "next/image";
import { count, eq } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { BottomNav, TabTopBar } from "@/components/nav";
import { ButtonLink, CurvesBackdrop, InfoRow, Panel, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { isCity } from "@/lib/cities";
import { countWord } from "@/lib/dates";
import { tbilisiDate, tbilisiYesterday } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { levelLabel } from "@/lib/xp";

export default async function ProfilePage() {
  const session = await requireUser();
  const t = await getTranslations("profilePage");
  const tc = await getTranslations("cities");
  const locale = (await getLocale()) as Locale;

  const [user, streak, [collections]] = await Promise.all([
    db.query.users.findFirst({ where: eq(schema.users.id, session.id) }),
    db.query.streaks.findFirst({ where: eq(schema.streaks.userId, session.id) }),
    db.select({ n: count() }).from(schema.badges),
  ]);
  if (!user) return null;
  const alive = streak && (streak.lastActiveDate === tbilisiDate() || streak.lastActiveDate === tbilisiYesterday());
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => [...w][0] ?? "")
    .join("");
  const location = isCity(user.city) ? (user.city === "outside" ? tc("outside") : `${tc(user.city)}, ${t("country")}`) : t("country");

  return (
    <Screen>
      <TabTopBar />
      <CurvesBackdrop clearance={100}>
        <Panel className="flex w-full flex-col gap-3 p-5">
          <div className="flex items-center gap-[14px]">
            <span className="relative flex size-14 shrink-0 items-center justify-center overflow-clip rounded-full bg-elevated text-h3 text-white">
              {user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="56px" className="object-cover" unoptimized /> : initials}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-5 text-center text-white">
              <h1 className="text-h3">{user.name}</h1>
              <p className="text-caption">{location}</p>
            </div>
          </div>
          <ButtonLink href="/profile/edit" variant="secondary">
            {t("edit")}
          </ButtonLink>
        </Panel>
        <InfoRow href="/xp" layout="centered" icon="/figma/icon-spark-20.svg" chevron="/figma/icon-chevron.svg" title={t("xp")} body={t("xpBody", { xp: user.xp.toLocaleString("en-US"), level: levelLabel(user.xp) })} />
        <InfoRow href="/streak" layout="centered" icon="/figma/icon-flame-20.svg" chevron="/figma/icon-chevron.svg" title={t("streak")} body={t("streakBody", { count: alive ? streak.current : 0 })} />
        <InfoRow href="/badges" layout="centered" icon="/figma/icon-badge-20.svg" chevron="/figma/icon-chevron.svg" title={t("badges")} body={t("badgesBody", { count: collections?.n ?? 0, word: countWord(collections?.n ?? 0, locale) })} />
        <InfoRow href="/settings" layout="centered" icon="/figma/icon-settings-20.svg" chevron="/figma/icon-chevron.svg" title={t("settings")} body={t("settingsBody")} />
      </CurvesBackdrop>
      <BottomNav active="profile" />
    </Screen>
  );
}

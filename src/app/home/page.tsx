// 06 მთავარი (Home) — Figma 87:6471
import { count, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChallengeCard } from "@/components/challenge-card";
import { BottomNav, TabTopBar } from "@/components/nav";
import { ButtonLink, InfoRow, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { getUserInterestIds, listChallenges } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { levelLabel } from "@/lib/xp";

export default async function HomePage() {
  const session = await requireUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home");

  const [user, streak, list, interestIds, [{ value: badgeCount }]] = await Promise.all([
    db.query.users.findFirst({ where: eq(schema.users.id, session.id), columns: { name: true, xp: true } }),
    db.query.streaks.findFirst({ where: eq(schema.streaks.userId, session.id) }),
    listChallenges(),
    getUserInterestIds(session.id),
    db.select({ value: count() }).from(schema.badges),
  ]);

  // Featured = first challenge matching the user's interests, otherwise the first one.
  const featured = list.find((r) => r.challenge.interestId && interestIds.includes(r.challenge.interestId)) ?? list[0];
  const firstName = (user?.name ?? "").split(" ")[0];
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ka-GE", { day: "2-digit", month: "long", timeZone: "Asia/Tbilisi" }).format(new Date());
  const xp = user?.xp ?? 0;

  return (
    <Screen>
      <TabTopBar />
      <main className="flex flex-col gap-5 p-5 pb-[110px]">
        <div className="flex flex-col gap-5 text-white">
          <p className="whitespace-pre-wrap text-caption">{t("eyebrow", { date })}</p>
          <h1 className="text-h2">{t("greeting", { name: firstName })}</h1>
          <p className="text-body">{t("body")}</p>
        </div>

        <div className="flex gap-3">
          <MetricLink href="/xp" icon="/figma/icon-spark.svg" label={t("totalXp")} value={`${xp.toLocaleString("en-US")} XP`} sub={t("level", { level: levelLabel(xp) })} />
          <MetricLink href="/streak" icon="/figma/icon-flame.svg" label={t("streak")} value={t("days", { count: streak?.current ?? 0 })} sub={t("best", { count: streak?.longest ?? 0 })} />
        </div>

        <div className="flex items-center gap-3">
          <h2 className="flex-1 text-h3 text-white">{t("featured")}</h2>
          <ButtonLink href="/discover" variant="quiet" className="!w-[128px] shrink-0">
            {t("seeAll")}
          </ButtonLink>
        </div>

        {featured && (
          <ChallengeCard
            mediaHeight={190}
            c={{
              slug: featured.challenge.slug,
              title: tr(featured.challenge, "title", locale),
              meta: `${featured.challenge.brand}  ·  +${featured.challenge.xpReward} XP`,
              coverUrl: featured.challenge.coverUrl,
              coverArt: featured.challenge.coverArt,
            }}
          />
        )}

        <InfoRow href="/badges" layout="centered" icon="/figma/icon-badge.svg" chevron="/figma/icon-chevron.svg" title={t("badges")} body={t("badgesMeta", { collections: badgeCount, levels: badgeCount * 4 })} />
      </main>
      <BottomNav active="home" />
    </Screen>
  );
}

function MetricLink({ href, icon, label, value, sub }: { href: string; icon: string; label: string; value: string; sub: string }) {
  return (
    <Link href={href} className="flex min-h-[120px] min-w-0 flex-1 flex-col gap-5 overflow-clip rounded-bf-16 border border-line bg-surface p-4 text-white transition-colors hover:bg-elevated/40">
      <span className="flex items-center gap-2">
        <Image src={icon} alt="" width={16} height={16} className="size-4 shrink-0" />
        <span className="text-caption">{label}</span>
      </span>
      <span className="text-center text-h2">{value}</span>
      <span className="text-center text-caption">{sub}</span>
    </Link>
  );
}

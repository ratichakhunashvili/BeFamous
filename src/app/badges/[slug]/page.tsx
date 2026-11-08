// Badge collection levels — 19 Flavor Legend (87:7891), 47 Street to Catwalk, 48 Cyber Evolution, 49 Glow Mastery, 50 Streak Mastery.
// Level states per user: earned / next (shows the condition button → 51) / locked.
import { and, asc, eq, inArray } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CollectionHero } from "@/components/collection-hero";
import { AppBar, ButtonLink, CurvesBackdrop, PageTitle, Panel, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { requireUser } from "@/lib/session";

export default async function BadgeCollectionPage({ params }: PageProps<"/badges/[slug]">) {
  const user = await requireUser();
  const { slug } = await params;
  const badge = await db.query.badges.findFirst({ where: eq(schema.badges.slug, slug) });
  if (!badge) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("badgesPage");
  const c = await getTranslations("common");

  const levels = await db.select().from(schema.badgeLevels).where(eq(schema.badgeLevels.badgeId, badge.id)).orderBy(asc(schema.badgeLevels.position));
  const earned = levels.length
    ? new Set(
        (
          await db
            .select({ id: schema.userBadgeLevels.levelId })
            .from(schema.userBadgeLevels)
            .where(and(eq(schema.userBadgeLevels.userId, user.id), inArray(schema.userBadgeLevels.levelId, levels.map((l) => l.id))))
        ).map((r) => r.id),
      )
    : new Set<string>();
  const nextId = levels.find((l) => !earned.has(l.id))?.id;
  const pct = levels.length ? (earned.size / levels.length) * 100 : 0;

  return (
    <Screen>
      <AppBar back="/badges" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <CollectionHero heroUrl={badge.heroUrl} art={badge.coverArt} />
        <PageTitle eyebrow={t("collection")} title={tr(badge, "name", locale)} body={tr(badge, "subtitle", locale)} />

        <Panel className="flex w-full flex-col gap-3 p-4 text-white">
          <h2 className="text-center text-h3">{t("progress")}</h2>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-caption">{t("received")}</span>
            <span className="text-right text-label">
              {earned.size} / {levels.length}
            </span>
          </div>
          <div className="h-2 w-full overflow-clip rounded-full bg-elevated" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </Panel>

        {levels.map((l) => {
          const state = earned.has(l.id) ? "earned" : l.id === nextId ? "next" : "locked";
          return (
            <Panel key={l.id} className="flex w-full flex-col gap-5 p-4 text-white">
              <p className="whitespace-pre text-center text-caption">{t("level", { n: String(l.position).padStart(2, "0"), xp: l.xpReward.toLocaleString("en-US") })}</p>
              <h3 className="text-center text-h3">{tr(l, "name", locale)}</h3>
              <p className="text-body">{tr(l, "condition", locale)}</p>
              {state === "earned" && <span className="flex h-9 w-[118px] items-center justify-center rounded-full bg-action text-caption">{t("earned")}</span>}
              {state === "locked" && <span className="flex h-9 w-[112px] items-center justify-center rounded-full bg-elevated text-caption">{t("locked")}</span>}
              {state === "next" && (
                <ButtonLink href={`/badges/${slug}/next`} variant="secondary">
                  {t("condition")}
                </ButtonLink>
              )}
            </Panel>
          );
        })}

        <div className="flex w-full flex-col gap-2 rounded-bf-16 bg-elevated p-4 text-white">
          <span className="flex items-center gap-2">
            <Image src="/figma/icon-gift.svg" alt="" width={18} height={18} className="size-[18px]" />
            <span className="text-label">{t("bonus")}</span>
          </span>
          <p className="text-body">{tr(badge, "bonus", locale)}</p>
        </div>
      </CurvesBackdrop>
    </Screen>
  );
}

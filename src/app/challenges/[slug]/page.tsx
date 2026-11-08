// 09 გამოწვევის დეტალი — Figma 87:6909 (same template for 34/35/36 with their data)
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, Panel, Screen, StickyBar } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { getChallengeBySlug, getParticipation } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function ChallengePage({ params }: PageProps<"/challenges/[slug]">) {
  const user = await requireUser();
  const { slug } = await params;
  const data = await getChallengeBySlug(slug);
  if (!data || data.challenge.status === "draft") notFound();
  const { challenge } = data;

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("challenge");
  const c = await getTranslations("common");
  const joined = Boolean(await getParticipation(user.id, challenge.id));
  const hero = challenge.heroUrl ?? challenge.coverUrl;
  const reward = tr(challenge, "reward", locale);

  return (
    <Screen>
      <AppBar back="/discover" brandLabel={c("brand")} />
      <CurvesBackdrop clearance={96}>
        <div className="relative h-[204px] w-full overflow-clip rounded-bf-16 bg-elevated">
          {hero ? (
            <Image src={hero} alt="" fill sizes="350px" className="object-cover" priority />
          ) : challenge.coverArt ? (
            <>
              <span className="absolute left-[199.85px] top-[-32.64px] h-[232.56px] w-[227.5px] rounded-full bg-surface" />
              <span className="absolute left-4 top-4 flex size-[62px] items-center justify-center rounded-bf-16 bg-bg">
                <Image src="/figma/icon-tech-32.svg" alt="" width={32} height={32} className="size-8" />
              </span>
              <span className="absolute left-4 top-[146px] text-caption text-white">{challenge.coverArt.kicker}</span>
              <span className="absolute left-4 top-[166px] text-h3 text-white">{challenge.coverArt.label}</span>
            </>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-5 text-white">
          <p className="whitespace-pre-wrap text-center text-caption">{`${tr(challenge, "category", locale)}  /  ${challenge.brand}`}</p>
          <h1 className="text-center text-h2">{tr(challenge, "title", locale)}</h1>
          <p className="text-body">{tr(challenge, "description", locale)}</p>
        </div>

        <div className="flex w-full gap-3">
          <Panel className="flex min-h-[128px] min-w-0 flex-1 flex-col gap-5 p-4 text-white">
            <span className="flex items-center gap-2">
              <Image src="/figma/icon-spark-16.svg" alt="" width={16} height={16} className="size-4" />
              <span className="text-caption">{t("xp")}</span>
            </span>
            <span className="text-center text-h2">+{challenge.xpReward} XP</span>
            <span className="text-center text-caption">{t("afterMissions")}</span>
          </Panel>
          <Panel className="flex min-h-[128px] min-w-0 flex-1 flex-col gap-2 p-4 text-white">
            <span className="flex items-center gap-2">
              <Image src="/figma/icon-gift-16.svg" alt="" width={16} height={16} className="size-4" />
              <span className="text-caption">{t("reward")}</span>
            </span>
            <span className={`text-h2 ${reward.length <= 10 ? "text-center" : ""}`}>{reward}</span>
          </Panel>
        </div>

        <Panel className="flex w-full flex-col gap-3 p-4">
          <h2 className="text-center text-h3 text-white">{t("howTo")}</h2>
          {(challenge.steps ?? []).map((s) => (
            <InfoRow
              key={s.titleKa}
              layout="centered"
              icon={s.icon}
              title={locale === "en" ? s.titleEn : s.titleKa}
              body={locale === "en" ? s.captionEn : s.captionKa}
              href={s.link === "rules" ? `/challenges/${slug}/rules` : undefined}
              chevron={s.link ? "/figma/icon-chevron.svg" : undefined}
            />
          ))}
        </Panel>
      </CurvesBackdrop>
      <StickyBar>
        <ButtonLink href={joined ? `/challenges/${slug}/missions` : `/challenges/${slug}/join`}>{joined ? t("continue") : t("join")}</ButtonLink>
      </StickyBar>
    </Screen>
  );
}

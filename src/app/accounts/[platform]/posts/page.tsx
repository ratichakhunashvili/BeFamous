// 57 პოსტის არჩევა — Figma 300:2386. Lists the posts we actually hold for this mission: links the user
// registered and posts an admin found by hashtag. Nothing is fetched from TikTok/Instagram.
import Image from "next/image";
import { and, desc, eq, ne } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { pickPostAction } from "@/app/actions/social";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { dayMonth } from "@/lib/dates";
import { isPlatform, missionParam, platformName, withMission } from "@/lib/params";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { missingHashtags } from "@/lib/social";

export default async function PickPostPage({ params, searchParams }: PageProps<"/accounts/[platform]/posts">) {
  const user = await requireUser();
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();
  const missionId = missionParam(await searchParams);
  const ctx = missionId ? await getMissionContext(user.id, missionId) : null;
  if (!ctx) redirect("/settings/accounts");
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("accountsPage");
  const c = await getTranslations("common");

  const [account, posts] = await Promise.all([
    db.query.linkedSocialAccounts.findFirst({ where: and(eq(schema.linkedSocialAccounts.userId, user.id), eq(schema.linkedSocialAccounts.platform, platform)) }),
    db
      .select()
      .from(schema.socialPosts)
      .where(and(eq(schema.socialPosts.userId, user.id), eq(schema.socialPosts.missionId, ctx.mission.id), eq(schema.socialPosts.platform, platform), ne(schema.socialPosts.status, "dismissed")))
      .orderBy(desc(schema.socialPosts.createdAt))
      .limit(20),
  ]);
  if (!account) redirect(withMission(`/accounts/${platform}/connect`, ctx.mission.id));

  const rows = posts.map((p) => {
    const title = p.title || t("untitled");
    const date = dayMonth(p.publishedAt ?? p.createdAt, locale);
    const early = p.publishedAt && ctx.challenge.startsAt && p.publishedAt < ctx.challenge.startsAt;
    const missing = missingHashtags(ctx.challenge.hashtags, p.caption);
    if (p.submissionId) return { p, title, kind: "link" as const, href: `/submissions/${p.submissionId}`, caption: `${date} · ${t("registered")}` };
    if (early) return { p, title, kind: "info" as const, caption: t("beforeCampaign") };
    return { p, title, kind: "pick" as const, caption: missing.length ? `${date} · ${t("missingTag")}` : `${date} · ${ctx.challenge.hashtags ?? ""}`.trim() };
  });

  return (
    <Screen>
      <AppBar back={withMission("/accounts/connect", ctx.mission.id)} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={`${platformName[platform]}  ·  ${account.handle}`} title={t("postsTitle")} body={rows.length ? t("postsBody") : t("postsEmpty")} />
        {rows.map((r) =>
          r.kind === "link" ? (
            <InfoRow key={r.p.id} href={r.href} layout="centered" icon="/figma/icon-play-20.svg" chevron="/figma/icon-chevron.svg" title={r.title} body={r.caption} />
          ) : r.kind === "info" ? (
            <InfoRow key={r.p.id} layout="centered" icon="/figma/icon-clock-26.svg" title={r.title} body={r.caption} />
          ) : (
            <form key={r.p.id} action={pickPostAction} className="w-full">
              <input type="hidden" name="postId" value={r.p.id} />
              <input type="hidden" name="missionId" value={ctx.mission.id} />
              <button type="submit" className="flex w-full items-center gap-3 overflow-clip rounded-bf-16 border border-line bg-surface p-3 transition-colors hover:bg-elevated/60">
                <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
                  <Image src="/figma/icon-play-20.svg" alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-5 text-center text-white">
                  <span className="text-label">{r.title}</span>
                  <span className="text-caption">{r.caption}</span>
                </span>
                <Image src="/figma/icon-chevron.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
              </button>
            </form>
          ),
        )}
        <ButtonLink href={`/challenges/${ctx.challenge.slug}/post`}>{t("notPosted")}</ButtonLink>
        <ButtonLink href={`/missions/${ctx.mission.id}/upload`} variant="secondary">
          {t("pasteLink")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}

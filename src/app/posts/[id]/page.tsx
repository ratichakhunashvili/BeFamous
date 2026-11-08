// Post verification states, one screen per stored social_posts.status (set by the admin / review):
// found → 59 · ownership_check → 60 · unavailable → 62 · metrics_unavailable → 63 · refresh_failed → 64.
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { confirmPostAction, dismissPostAction } from "@/app/actions/social";
import { StatusScreen } from "@/components/status-screen";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink } from "@/components/ui";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { isPlatform, platformName, withMission } from "@/lib/params";
import { requireUser } from "@/lib/session";

export default async function PostStatePage({ params }: PageProps<"/posts/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [row] = await db
    .select({ post: schema.socialPosts, challenge: schema.challenges })
    .from(schema.socialPosts)
    .innerJoin(schema.missions, eq(schema.missions.id, schema.socialPosts.missionId))
    .innerJoin(schema.challenges, eq(schema.challenges.id, schema.missions.challengeId))
    .where(and(eq(schema.socialPosts.id, id), eq(schema.socialPosts.userId, user.id)));
  if (!row) notFound();
  const { post, challenge } = row;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("postStates");
  const platform = isPlatform(post.platform) ? post.platform : "tiktok";
  const challengeTitle = tr(challenge, "title", locale);

  switch (post.status) {
    case "waiting":
      redirect(`/challenges/${challenge.slug}/post`);
    case "verified":
      redirect(post.submissionId ? `/submissions/${post.submissionId}` : "/activity");
    case "auth_expired":
      redirect(`/accounts/${platform}/expired`);
    case "dismissed":
      redirect("/notifications");

    case "found": {
      const tags = (challenge.hashtags ?? "").split(/\s+/).filter(Boolean);
      const tag = tags.find((x) => x.toLowerCase() !== "#befamous") ?? tags[0] ?? "#BeFamous";
      return (
        <StatusScreen back="/notifications" icon="/figma/icon-search-26.svg" title={t("foundTitle")} body={t("foundBody", { platform: platformName[platform], tag })}>
          <form action={confirmPostAction} className="w-full">
            <input type="hidden" name="postId" value={post.id} />
            <SubmitButton>{t("mine")}</SubmitButton>
          </form>
          <form action={dismissPostAction} className="w-full">
            <input type="hidden" name="postId" value={post.id} />
            <SubmitButton variant="secondary">{t("notMine")}</SubmitButton>
          </form>
        </StatusScreen>
      );
    }
    case "ownership_check":
      return (
        <StatusScreen back="/activity" icon="/figma/icon-clock-26.svg" title={t("ownershipTitle")} body={t("ownershipBody")}>
          <ButtonLink href="/activity">{t("myActivity")}</ButtonLink>
          <ButtonLink href={withMission("/accounts/connect", post.missionId)} variant="secondary">
            {t("connect")}
          </ButtonLink>
        </StatusScreen>
      );
    case "unavailable":
      return (
        <StatusScreen back="/notifications" icon="/figma/icon-close-26.svg" title={t("unavailableTitle")} body={t("unavailableBody", { challenge: challengeTitle })}>
          <ButtonLink href={withMission(`/accounts/${platform}/posts`, post.missionId)}>{t("otherPost")}</ButtonLink>
          <ButtonLink href={`/challenges/${challenge.slug}/rules`} variant="secondary">
            {t("rules")}
          </ButtonLink>
        </StatusScreen>
      );
    case "metrics_unavailable":
      return (
        <StatusScreen back="/notifications" icon="/figma/icon-chart-26.svg" title={t("metricsTitle")} body={t("metricsBody")}>
          <ButtonLink href="/activity">{t("myActivity")}</ButtonLink>
          <ButtonLink href="/settings/terms" variant="secondary">
            {t("why")}
          </ButtonLink>
        </StatusScreen>
      );
    case "refresh_failed": {
      const body = post.lastSyncedAt ? t("refreshBody", { ago: ago(post.lastSyncedAt, t) }) : t("refreshNever");
      return (
        <StatusScreen back="/notifications" icon="/figma/icon-clock-26.svg" title={t("refreshTitle")} body={body}>
          {/* Metrics are updated by the admin for now, so "retry" reloads the latest stored state. */}
          <ButtonLink href={`/posts/${post.id}`} prefetch={false}>
            {t("retry")}
          </ButtonLink>
          <ButtonLink href="/activity" variant="secondary">
            {t("myActivity")}
          </ButtonLink>
        </StatusScreen>
      );
    }
  }
}

function ago(d: Date, t: Awaited<ReturnType<typeof getTranslations<"postStates">>>) {
  const minutes = Math.max(1, Math.round((new Date().getTime() - d.getTime()) / 60_000));
  if (minutes < 60) return t("minutesAgo", { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t("hoursAgo", { count: hours });
  return t("daysAgo", { count: Math.round(hours / 24) });
}

// 41 მედია მზადაა — Figma 87:9889. Shows the found post (TikTok preview when available) to confirm.
import { and, eq } from "drizzle-orm";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen, StickyBar } from "@/components/ui";
import { PostingRules } from "@/components/posting-rules";
import { db, schema } from "@/db";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { missingHashtags } from "@/lib/social";

export default async function ConfirmPostPage({ params }: PageProps<"/missions/[id]/upload/[submissionId]">) {
  const user = await requireUser();
  const { id, submissionId } = await params;
  const ctx = await getMissionContext(user.id, id);
  if (!ctx || !/^[0-9a-f-]{36}$/i.test(submissionId)) notFound();
  const sub = await db.query.submissions.findFirst({
    where: and(eq(schema.submissions.id, submissionId), eq(schema.submissions.userId, user.id), eq(schema.submissions.missionId, id)),
  });
  if (!sub) notFound();
  if (sub.status !== "draft") redirect(`/submissions/${sub.id}`);

  const t = await getTranslations("post");
  const c = await getTranslations("common");
  const platform = sub.platform === "tiktok" ? "TikTok" : "Instagram";
  const tags = ctx.challenge.hashtags ?? "";
  const found = sub.caption != null && missingHashtags(tags, sub.caption).length === 0;
  const thumb = sub.thumbnailUrl ?? ctx.challenge.heroUrl ?? ctx.challenge.coverUrl;

  return (
    <Screen>
      <AppBar back={`/missions/${id}/upload`} brandLabel={c("brand")} />
      <CurvesBackdrop clearance={96}>
        <PageTitle eyebrow={t("eyebrow", { n: ctx.number })} title={t("title")} body={t("body")} />
        <div className="relative h-[180px] w-full overflow-clip rounded-bf-16 bg-elevated">
          {thumb && <Image src={thumb} alt="" fill sizes="350px" unoptimized={Boolean(sub.thumbnailUrl)} className="object-cover object-[center_35%]" />}
        </div>
        <InfoRow layout="centered" icon="/figma/icon-check.svg" title={`${platform} · ${sub.handle ?? "—"}`} body={`${tags} · ${found ? t("found") : t("notChecked")}`} />
        <ButtonLink href={`/missions/${id}/upload`} variant="secondary">
          {t("other")}
        </ButtonLink>
        <PostingRules hashtags={ctx.challenge.hashtags} />
      </CurvesBackdrop>
      <StickyBar>
        <ButtonLink href={`/missions/${id}/upload/${sub.id}/checking`}>{t("confirm")}</ButtonLink>
      </StickyBar>
    </Screen>
  );
}

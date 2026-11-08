// 13 ნამუშევრის ატვირთვა / პოსტის დარეგისტრირება — Figma 87:7303.
// The user posts on TikTok/Instagram, then registers the post here (pick from a linked account, or paste the link).
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { PostingRules } from "@/components/posting-rules";
import { getMissionContext } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { PostLinkForm } from "./post-link-form";

export default async function RegisterPostPage({ params }: PageProps<"/missions/[id]/upload">) {
  const user = await requireUser();
  const { id } = await params;
  const ctx = await getMissionContext(user.id, id);
  if (!ctx || ctx.mission.type !== "upload") notFound();
  if (!ctx.joined) redirect(`/challenges/${ctx.challenge.slug}/join`);
  const t = await getTranslations("post");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back={`/challenges/${ctx.challenge.slug}/missions`} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow", { n: ctx.number })} title={t("title")} body={t("body")} />
        <InfoRow href={`/accounts/connect?mission=${id}`} layout="centered" icon="/figma/icon-upload-20.svg" chevron="/figma/icon-chevron.svg" title={t("connectTitle")} body={t("connectBody")} />
        <PostLinkForm
          missionId={id}
          labels={{
            label: t("linkLabel"),
            placeholder: t("linkPlaceholder"),
            submit: t("submitLink"),
            errors: { invalid: t("errors.invalid"), locked: t("errors.locked"), done: t("errors.done") },
          }}
        />
        <PostingRules hashtags={ctx.challenge.hashtags} />
      </CurvesBackdrop>
    </Screen>
  );
}

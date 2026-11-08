// 10 მონაწილეობა (visit challenges) / 37 ვიდეო გამოწვევაში ჩართვა (video challenges) — Figma 87:7044 / 87:9655.
// Same screen; "not now" goes back to the challenge (10) or to discover (37).
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { joinChallengeAction } from "@/app/actions/challenges";
import { AppBar, Button, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen, StickyBar } from "@/components/ui";
import { getChallengeBySlug } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function JoinPage({ params }: PageProps<"/challenges/[slug]/join">) {
  await requireUser();
  const { slug } = await params;
  const data = await getChallengeBySlug(slug);
  if (!data || data.challenge.status !== "active") notFound();
  const t = await getTranslations("join");
  const c = await getTranslations("common");
  const isVisit = data.challenge.kind === "visit";

  return (
    <Screen>
      <AppBar back={`/challenges/${slug}`} brandLabel={c("brand")} />
      <CurvesBackdrop clearance={96}>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        <InfoRow layout="titleCentered" icon="/figma/icon-camera-20.svg" title={t("ownTitle")} body={t("ownBody")} />
        <InfoRow layout="titleCentered" icon="/figma/icon-check.svg" title={t("reviewTitle")} body={t("reviewBody")} />
        <InfoRow layout="centered" href={`/challenges/${slug}/rules`} icon="/figma/icon-activity.svg" chevron="/figma/icon-chevron.svg" title={t("termsTitle")} body={t("termsBody")} />
        <ButtonLink href={isVisit ? `/challenges/${slug}` : "/discover"} variant="secondary">
          {t("notNow")}
        </ButtonLink>
      </CurvesBackdrop>
      <StickyBar>
        <form action={joinChallengeAction}>
          <input type="hidden" name="slug" value={slug} />
          <Button type="submit">{t("start")}</Button>
        </form>
      </StickyBar>
    </Screen>
  );
}

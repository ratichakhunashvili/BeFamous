// 56 ანგარიშის დაკავშირება — Figma 300:2228. Pick TikTok or Instagram → enter the handle → 57.
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { getMissionContext } from "@/lib/queries";
import { missionParam, withMission } from "@/lib/params";
import { requireUser } from "@/lib/session";

export default async function ConnectAccountPage({ searchParams }: PageProps<"/accounts/connect">) {
  const user = await requireUser();
  const missionId = missionParam(await searchParams);
  const ctx = missionId ? await getMissionContext(user.id, missionId) : null;
  const t = await getTranslations("accountsPage");
  const c = await getTranslations("common");
  const back = ctx ? `/missions/${ctx.mission.id}/upload` : "/settings/accounts";
  const m = ctx?.mission.id ?? null;

  return (
    <Screen>
      <AppBar back={back} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={ctx ? t("connectEyebrow", { n: ctx.number }) : t("connectEyebrowPlain")} title={t("connectTitle")} body={t("connectBody")} />
        <InfoRow href={withMission("/accounts/tiktok/connect", m)} layout="centered" icon="/figma/icon-play-20.svg" chevron="/figma/icon-chevron.svg" title="TikTok" body={t("availability")} />
        <InfoRow href={withMission("/accounts/instagram/connect", m)} layout="centered" icon="/figma/icon-camera-20.svg" chevron="/figma/icon-chevron.svg" title="Instagram" body={t("availability")} />
        <InfoRow href="/settings/terms" layout="centered" icon="/figma/icon-lock-26.svg" chevron="/figma/icon-chevron.svg" title={t("whatWeSee")} body={t("whatWeSeeBody")} />
        <ButtonLink href={withMission("/accounts/tiktok/connect", m)}>{t("continueTikTok")}</ButtonLink>
        <ButtonLink href={ctx ? `/missions/${ctx.mission.id}/upload` : "/activity"} variant="secondary">
          {t("pasteLink")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}

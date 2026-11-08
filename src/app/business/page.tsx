// 72 ბიზნეს ანგარიში — Figma 300:3920. Public info screen (from 02); the panel itself is the admin (Phase 6).
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";

export default async function BusinessPage() {
  const t = await getTranslations("businessPage");
  const c = await getTranslations("common");
  return (
    <Screen>
      <AppBar back="/roles" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        <InfoRow layout="centered" icon="/figma/icon-campaign.svg" title={t("campaign")} body={t("campaignBody")} />
        <InfoRow layout="centered" icon="/figma/icon-team.svg" title={t("review")} body={t("reviewBody")} />
        <InfoRow layout="centered" icon="/figma/icon-chart-20.svg" title={t("metrics")} body={t("metricsBody")} />
        <ButtonLink href="/business/panel">{t("open")}</ButtonLink>
        <ButtonLink href="/signup" variant="secondary">
          {t("asUser")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}

// Shared body for 31 (from sign-up) and 73 (from settings). Only the back/close targets differ.
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import { CloseBackButton } from "./close-back-button";

export async function TermsScreen({ closeHref }: { closeHref?: string }) {
  const t = await getTranslations("terms");
  const c = await getTranslations("common");
  return (
    <Screen>
      <AppBar back={closeHref ?? "history"} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="mixed" />
        <InfoRow layout="centered" icon="/figma/icon-check.svg" title={t("originalTitle")} body={t("originalBody")} />
        <InfoRow layout="centered" icon="/figma/icon-activity.svg" title={t("reviewTitle")} body={t("reviewBody")} />
        <InfoRow layout="centered" icon="/figma/icon-lock-20.svg" title={t("dataTitle")} body={t("dataBody")} />
        {closeHref ? <ButtonLink href={closeHref}>{c("close")}</ButtonLink> : <CloseBackButton label={c("close")} />}
      </CurvesBackdrop>
    </Screen>
  );
}

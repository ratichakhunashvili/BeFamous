// 29 პაროლის აღდგენა (Reset password) — Figma 87:8949
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { RequestResetForm } from "./request-reset-form";

export default async function ResetPage() {
  const t = await getTranslations("reset");
  const c = await getTranslations("common");
  return (
    <Screen>
      <AppBar back="/signin" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        <RequestResetForm />
      </CurvesBackdrop>
    </Screen>
  );
}

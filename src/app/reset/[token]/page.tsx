// Set a new password from the emailed link. No Figma frame exists for this step,
// so it reuses the layout of 29 (same backdrop, title block, field and primary button).
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { NewPasswordForm } from "./new-password-form";

export default async function NewPasswordPage({ params }: PageProps<"/reset/[token]">) {
  const { token } = await params;
  const t = await getTranslations("reset");
  const c = await getTranslations("common");
  return (
    <Screen>
      <AppBar back="/signin" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("newTitle")} body={t("newBody")} />
        <NewPasswordForm token={token} />
      </CurvesBackdrop>
    </Screen>
  );
}

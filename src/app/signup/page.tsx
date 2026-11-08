// 04 რეგისტრაცია (Sign up) — Figma 87:6268
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  if ((await auth())?.user) redirect("/home");
  const t = await getTranslations("signup");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back="history" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        <SignupForm />
      </CurvesBackdrop>
    </Screen>
  );
}

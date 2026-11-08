// 03 შესვლა (Sign in) — Figma 87:6193
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { SigninForm } from "./signin-form";

export default async function SigninPage({ searchParams }: PageProps<"/signin">) {
  if ((await auth())?.user) redirect("/home");
  const t = await getTranslations("signin");
  const c = await getTranslations("common");
  const { reset } = await searchParams;

  return (
    <Screen>
      <AppBar back="/" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        {reset && <p className="w-full text-center text-caption text-accent">{t("resetDone")}</p>}
        <SigninForm />
      </CurvesBackdrop>
    </Screen>
  );
}

// 01 მისალმება (Welcome) — Figma 87:5990
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AppBar, ButtonLink, PageTitle, Screen } from "@/components/ui";

export default async function WelcomePage() {
  if ((await auth())?.user) redirect("/home");
  const t = await getTranslations("welcome");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar brandLabel={c("brand")} />
      <main className="flex flex-col items-start gap-4 p-5">
        {/* Media / creator card: exported from Figma as one SVG (it includes the illustration and its caption). */}
        <Image src="/figma/welcome-media.svg" alt={t("mediaAlt")} width={350} height={270} priority className="h-auto w-full rounded-bf-16" />
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="start" gap={8} />
        <ButtonLink href="/roles">{t("start")}</ButtonLink>
        <ButtonLink href="/signin" variant="secondary">
          {c("signin")}
        </ButtonLink>
      </main>
    </Screen>
  );
}

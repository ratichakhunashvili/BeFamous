// 30 ელფოსტა გაგზავნილია (Email sent) — Figma 87:8998
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, Screen } from "@/components/ui";

export default async function ResetSentPage({ searchParams }: PageProps<"/reset/sent">) {
  const t = await getTranslations("reset");
  const c = await getTranslations("common");
  const { email } = await searchParams;

  return (
    <Screen>
      <AppBar back="/signin" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <section className="flex w-full flex-col gap-5 overflow-clip rounded-bf-16 border border-line bg-surface p-6">
          <span className="relative size-[52px] overflow-clip rounded-bf-16 bg-elevated">
            <Image src="/figma/icon-mail-26.svg" alt="" width={26} height={26} className="absolute left-[13px] top-[13px] size-[26px]" />
          </span>
          <h1 className="text-center text-h2 text-white">{t("sentTitle")}</h1>
          <p className="break-words text-body text-white">{t("sentBody", { email: typeof email === "string" ? email : "" })}</p>
        </section>
        <ButtonLink href="/signin">{t("backToSignin")}</ButtonLink>
        <ButtonLink href="/reset" variant="secondary">
          {t("resend")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}

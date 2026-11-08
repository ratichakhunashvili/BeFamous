// 02 ანგარიშის არჩევა (Account type) — Figma 5:737
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, InfoRow, PageTitle, Screen } from "@/components/ui";

export default async function RolesPage() {
  const t = await getTranslations("roles");
  const c = await getTranslations("common");

  return (
    <Screen>
      {/* Decorative pattern with curved bottom edge (mirrored horizontally, as in Figma). */}
      <div className="pointer-events-none absolute left-0 top-6 h-[375px] w-full -scale-x-100 overflow-clip" aria-hidden>
        <div
          className="absolute inset-x-0 top-0 h-[380px]"
          style={{
            maskImage: "url(/figma/pattern-mask.svg)",
            maskSize: "100% 345.395px",
            maskRepeat: "no-repeat",
            WebkitMaskImage: "url(/figma/pattern-mask.svg)",
            WebkitMaskSize: "100% 345.395px",
            WebkitMaskRepeat: "no-repeat",
          }}
        >
          <Image src="/figma/pattern-fill.png" alt="" fill sizes="390px" className="object-cover" priority />
        </div>
      </div>

      <AppBar back="/" backStyle="plain" brandLabel={c("brand")} />

      <main className="relative mt-[270px] flex flex-col items-start gap-4 bg-bg p-5">
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="start" gap={8} />
        <InfoRow href="/signup" icon="/figma/icon-profile.svg" chevron="/figma/icon-chevron-02.svg" title={t("userTitle")} body={t("userBody")} />
        <InfoRow href="/business" icon="/figma/icon-campaign.svg" chevron="/figma/icon-chevron-02.svg" title={t("businessTitle")} body={t("businessBody")} />
        <ButtonLink href="/signin">{t("haveAccount")}</ButtonLink>
      </main>
    </Screen>
  );
}

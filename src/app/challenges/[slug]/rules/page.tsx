// 65 კამპანიის წესები (Campaign rules) — Figma 300:3069
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, ButtonLink, CurvesBackdrop, InfoRow, PageTitle, Screen } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { getChallengeBySlug } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function RulesPage({ params }: PageProps<"/challenges/[slug]/rules">) {
  await requireUser();
  const { slug } = await params;
  const data = await getChallengeBySlug(slug);
  if (!data) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("rules");
  const c = await getTranslations("common");

  return (
    <Screen>
      <AppBar back="history" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow", { title: tr(data.challenge, "title", locale) })} title={t("title")} body={t("body")} />
        {(data.challenge.rules ?? []).map((r) => (
          <InfoRow key={r.titleKa} layout="centered" icon={r.icon} title={locale === "en" ? r.titleEn : r.titleKa} body={locale === "en" ? r.captionEn : r.captionKa} />
        ))}
        <ButtonLink href={`/challenges/${slug}`}>{t("ok")}</ButtonLink>
        <ButtonLink href="/terms" variant="secondary">
          {t("full")}
        </ButtonLink>
      </CurvesBackdrop>
    </Screen>
  );
}

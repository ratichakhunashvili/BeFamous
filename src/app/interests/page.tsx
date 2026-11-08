// 05 ინტერესები (Interests) — Figma 87:6364. 32 is the same screen with choices made.
import { getLocale, getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { tr } from "@/lib/i18n-fields";
import { getInterests, getUserInterestIds } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { InterestsForm } from "./interests-form";

export default async function InterestsPage() {
  const user = await requireUser();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("interests");
  const c = await getTranslations("common");
  const [all, mine] = await Promise.all([getInterests(), getUserInterestIds(user.id)]);

  return (
    <Screen>
      <AppBar back="/signup" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="bodyStart" />
        <InterestsForm
          interests={all.map((i) => ({ slug: i.slug, name: tr(i, "name", locale), icon: i.icon ?? "/figma/icon-check.svg", selected: mine.includes(i.id) }))}
          labels={{ tap: t("tap"), selected: t("selected"), finish: t("finish"), skip: t("skip") }}
        />
      </CurvesBackdrop>
    </Screen>
  );
}

// 08 ძიება და ფილტრი (Search & filter) — Figma 87:6809. Submits a GET form to /discover.
import { getLocale, getTranslations } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { cities, isCity } from "@/lib/cities";
import { tr } from "@/lib/i18n-fields";
import { getInterests, listChallenges } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { FiltersForm } from "./filters-form";

export default async function FiltersPage({ searchParams }: PageProps<"/discover/filters">) {
  const session = await requireUser();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("filters");
  const tCity = await getTranslations("cities");
  const c = await getTranslations("common");

  const [interests, all, user] = await Promise.all([getInterests(), listChallenges(), db.query.users.findFirst({ where: eq(schema.users.id, session.id), columns: { city: true } })]);
  const counts = new Map<string, number>();
  for (const r of all) if (r.interestSlug) counts.set(r.interestSlug, (counts.get(r.interestSlug) ?? 0) + 1);

  return (
    <Screen>
      <AppBar back="/discover" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} align="bodyStart" />
        <FiltersForm
          initial={{ q: typeof sp.q === "string" ? sp.q : "", city: isCity(sp.city) ? sp.city : isCity(user?.city) ? user.city : "tbilisi", category: typeof sp.category === "string" ? sp.category : "" }}
          cities={cities.map((id) => ({ id, label: tCity(id) }))}
          categories={interests.map((i) => ({ slug: i.slug, name: tr(i, "name", locale), empty: !counts.get(i.slug) }))}
          labels={{
            keyword: t("keyword"),
            keywordPlaceholder: t("keywordPlaceholder"),
            location: t("location"),
            selected: t("selectedCategory"),
            tap: t("tapCategory"),
            none: t("noChallenges"),
            show: t("show"),
            clear: t("clear"),
          }}
        />
      </CurvesBackdrop>
    </Screen>
  );
}

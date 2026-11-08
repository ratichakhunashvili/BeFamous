// Shared server part of step 12 (new campaign and editing an existing one).
import { asc } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { deleteDraftAction } from "@/app/actions/admin-campaigns";
import { WizardLayout } from "@/components/admin/wizard";
import { SubmitButton } from "@/components/submit-button";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import type { Campaign } from "@/lib/admin-campaigns";
import { cities } from "@/lib/cities";
import { tr } from "@/lib/i18n-fields";
import { BasicsForm } from "./basics-form";

const isoDay = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi" }).format(d) : "");

export async function BasicsPage({ campaign }: { campaign: Campaign | null }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.wizard");
  const tc = await getTranslations("cities");
  const interests = await db.select().from(schema.interests).orderBy(asc(schema.interests.sortOrder));
  const ch = campaign?.challenge;
  const initial: Record<string, string> = ch
    ? {
        id: ch.id,
        titleKa: ch.titleKa,
        titleEn: ch.titleEn,
        descriptionKa: ch.descriptionKa ?? "",
        descriptionEn: ch.descriptionEn ?? "",
        brand: ch.brand ?? "",
        interestId: ch.interestId ?? "",
        kind: ch.kind,
        city: ch.city ?? "",
        hashtags: ch.hashtags ?? "#BeFamous",
        startsAt: isoDay(ch.startsAt),
        endsAt: isoDay(ch.endsAt),
      }
    : { hashtags: "#BeFamous", kind: "video" };
  return (
    <WizardLayout campaign={campaign} step="basics" back={ch ? `/admin/campaigns/${ch.id}` : "/admin/campaigns"} title={t("basicsTitle")} body={t("basicsBody")}>
      <BasicsForm
        initial={initial}
        interests={interests.map((i) => ({ value: i.id, label: tr(i, "name", locale) }))}
        kinds={[
          { value: "video", label: t("kindVideo") },
          { value: "visit", label: t("kindVisit") },
        ]}
        cities={cities.map((c) => ({ value: c, label: tc(c) }))}
        labels={{
          titleKa: t("fTitleKa"),
          titleEn: t("fTitleEn"),
          goalKa: t("fGoalKa"),
          goalEn: t("fGoalEn"),
          brand: t("fBrand"),
          interest: t("fInterest"),
          noInterest: t("fNoInterest"),
          kind: t("fKind"),
          city: t("fCity"),
          noCity: t("fNoCity"),
          hashtags: t("fHashtags"),
          hashtagsHint: t("fHashtagsHint"),
          startsAt: t("fStartsAt"),
          endsAt: t("fEndsAt"),
          draft: t("saveDraft"),
          next: t("toMissions"),
          invalid: t("invalid"),
          endsBefore: t("endsBefore"),
        }}
      />
      {ch?.status === "draft" && campaign?.joined === 0 && (
        <form action={deleteDraftAction}>
          <input type="hidden" name="campaignId" value={ch.id} />
          <SubmitButton variant="quiet">{t("deleteDraft")}</SubmitButton>
        </form>
      )}
    </WizardLayout>
  );
}

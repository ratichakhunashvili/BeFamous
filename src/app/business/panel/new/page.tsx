// Business: create a campaign — pick the topic (cards), the type, dates, hashtags and reward.
// Can be pre-filled from an AI advisor idea (?titleKa=…&topic=…).
import { asc } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminBody, AdminTitle } from "@/components/admin/shell";
import { db, schema } from "@/db";
import type { Locale } from "@/i18n/request";
import { sinceDays } from "@/lib/admin-stats";
import { cities } from "@/lib/cities";
import { tr } from "@/lib/i18n-fields";
import { requireBusinessPage } from "@/lib/session";
import { NewCampaignForm } from "./new-campaign-form";

export default async function NewBusinessCampaign({ searchParams }: PageProps<"/business/panel/new">) {
  const me = await requireBusinessPage();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("biz");
  const tc = await getTranslations("cities");
  const interests = await db.select().from(schema.interests).orderBy(asc(schema.interests.sortOrder));
  const q = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).slice(0, 400) : "");
  const topic = interests.find((i) => i.slug === q("topic"));
  const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi" }).format(d);
  const initial = {
    titleKa: q("titleKa"),
    titleEn: q("titleEn"),
    descriptionKa: q("descriptionKa"),
    brand: me.name ?? "",
    interestId: topic?.id ?? "",
    kind: q("kind") === "visit" ? "visit" : "video",
    hashtags: q("hashtag"),
    rewardKa: q("rewardKa"),
    startsAt: iso(sinceDays(-1)),
    endsAt: iso(sinceDays(-31)),
  };
  return (
    <AdminBody>
      <AdminTitle eyebrow={t("newEyebrow")} title={t("newTitle")} body={t("newBody")} />
      <NewCampaignForm
        initial={initial}
        topics={interests.map((i) => ({ id: i.id, label: tr(i, "name", locale), icon: i.icon ?? "/figma/icon-camera.svg" }))}
        cities={cities.map((c) => ({ value: c, label: tc(c) }))}
        labels={{
          topic: t("fTopic"),
          titleKa: t("fTitleKa"),
          titleEn: t("fTitleEn"),
          descKa: t("fDescKa"),
          descEn: t("fDescEn"),
          brand: t("fBrand"),
          kind: t("fKind"),
          kindVisit: t("kindVisit"),
          kindVideo: t("kindVideo"),
          city: t("fCity"),
          allCities: t("allCities"),
          hashtags: t("fHashtags"),
          hashtagsHint: t("fHashtagsHint"),
          startsAt: t("fStart"),
          endsAt: t("fEnd"),
          rewardKa: t("fRewardKa"),
          rewardEn: t("fRewardEn"),
          rewardValue: t("fRewardValue"),
          rewardStock: t("fRewardStock"),
          submit: t("submit"),
          note: t("submitNote"),
          invalid: t("invalid"),
          aiHint: t("aiHint"),
        }}
      />
    </AdminBody>
  );
}

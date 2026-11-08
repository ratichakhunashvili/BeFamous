// Admin 16 გადახედვა — Figma 7:532. Read-only summary before publishing.
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CollectionHero } from "@/components/collection-hero";
import { WizardLayout } from "@/components/admin/wizard";
import { ButtonLink } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { getCampaign } from "@/lib/admin-campaigns";
import { dateRange } from "@/lib/dates";
import { tr } from "@/lib/i18n-fields";
import { requireAdminPage } from "@/lib/session";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2/5 text-caption text-muted">{label}</span>
      <span className="flex-1 text-right text-label text-text">{value}</span>
    </div>
  );
}

export default async function ReviewStepPage({ params }: PageProps<"/admin/campaigns/[id]/edit/review">) {
  await requireAdminPage();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin.wizard");
  const tc = await getTranslations("cities");
  const { challenge: c, reward: r } = campaign;
  const budget = r ? (r.valueGel != null && r.stock != null ? `${r.valueGel} ₾ × ${r.stock} · ${r.valueGel * r.stock} ₾` : tr(r, "title", locale)) : t("noReward");
  const method = c.rules?.find((x) => x.titleKa === "შეფასება");
  return (
    <WizardLayout campaign={campaign} step="review" back={`/admin/campaigns/${c.id}/edit/rules`} title={t("reviewTitle")} body={t("reviewBody")}>
      <CollectionHero heroUrl={c.heroUrl ?? c.coverUrl} art={c.coverArt} height={190} ellipse={{ left: 559.49, top: -30.4, w: 243.2, h: 216.6 }} />
      <h2 className="text-h2 text-text">{tr(c, "title", locale)}</h2>
      <Row label={t("duration")} value={dateRange(c.startsAt, c.endsAt, locale)} />
      <Row label={t("location")} value={c.city === "tbilisi" || c.city === "batumi" || c.city === "kutaisi" || c.city === "outside" ? tc(c.city) : "—"} />
      <Row label={t("missionsCount")} value={String(campaign.missions.length)} />
      <Row label={t("hashtagsRow")} value={c.hashtags ?? "—"} />
      <Row label={t("budget")} value={budget} />
      <Row label={t("scoring")} value={method ? (locale === "en" ? method.captionEn : method.captionKa) : "—"} />
      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href="/admin/campaigns?status=draft" variant="secondary">
          {t("saveDraft")}
        </ButtonLink>
        <ButtonLink href={`/admin/campaigns/${c.id}/edit/publish`}>{t("toPublish")}</ButtonLink>
      </div>
    </WizardLayout>
  );
}

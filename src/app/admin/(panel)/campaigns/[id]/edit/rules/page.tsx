// Admin 15 წესები და შეფასება — Figma 7:492. The three texts become the rules list users see on
// screen 65 before joining (plus the hashtags and reward rows, added automatically).
// The Figma scoring weights / three winners strip is shown as information only: winners are chosen
// by hand on 48 from approved posts; automatic scoring would need platform data we don't have.
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InfoStrip, WizardLayout } from "@/components/admin/wizard";
import { getCampaign } from "@/lib/admin-campaigns";
import { requireAdminPage } from "@/lib/session";
import { RulesForm } from "./rules-form";

export default async function RulesStepPage({ params }: PageProps<"/admin/campaigns/[id]/edit/rules">) {
  await requireAdminPage();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const t = await getTranslations("admin.wizard");
  const id = campaign.challenge.id;
  const row = (titleKa: string) => campaign.challenge.rules?.find((r) => r.titleKa === titleKa);
  const entry = row("მონაწილეობის პირობა");
  const work = row("ნამუშევრის პირობა");
  const method = row("შეფასება");
  return (
    <WizardLayout
      campaign={campaign}
      step="rules"
      back={`/admin/campaigns/${id}/edit/rewards`}
      title={t("rulesTitle")}
      body={t("rulesBody")}
      below={<InfoStrip lines={t.raw("scoringLines") as string[]} />}
    >
      <RulesForm
        campaignId={id}
        initial={{
          entryKa: entry?.captionKa ?? "ერთი ანგარიში · ერთი ნამუშევარი",
          entryEn: entry?.captionEn ?? "One account · one entry",
          methodKa: method?.captionKa ?? "მოდერაცია ბრენდის მიერ",
          methodEn: method?.captionEn ?? "Moderated by the brand",
          workKa: work?.captionKa ?? "ორიგინალური ვიდეო · 15–30 წამი",
          workEn: work?.captionEn ?? "Original video · 15–30 seconds",
        }}
        labels={{
          entry: t("fEntry"),
          method: t("fMethod"),
          work: t("fWork"),
          ka: t("ka"),
          en: t("en"),
          consent: t("consent"),
          consentBody: t("consentBody"),
          draft: t("saveDraft"),
          next: t("toReview"),
          invalid: t("invalid"),
        }}
      />
    </WizardLayout>
  );
}

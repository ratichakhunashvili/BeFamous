// Admin 14 ბიუჯეტი და ჯილდოები — Figma 7:452. The total budget is calculated (quantity × value), not typed.
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InfoStrip, WizardLayout } from "@/components/admin/wizard";
import { getCampaign } from "@/lib/admin-campaigns";
import { requireAdminPage } from "@/lib/session";
import { RewardStepForm } from "./reward-step-form";

const isoDay = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi" }).format(d) : "");

export default async function RewardsStepPage({ params }: PageProps<"/admin/campaigns/[id]/edit/rewards">) {
  await requireAdminPage();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const t = await getTranslations("admin.wizard");
  const r = campaign.reward;
  const id = campaign.challenge.id;
  return (
    <WizardLayout
      campaign={campaign}
      step="rewards"
      back={`/admin/campaigns/${id}/edit/missions`}
      title={t("rewardsTitle")}
      body={t("rewardsBody")}
      below={<InfoStrip lines={[t("prizeTypesTitle"), t("prizeTypes"), t("prizeTypesNote")]} />}
    >
      <RewardStepForm
        campaignId={id}
        initial={{
          rewardKa: r?.titleKa ?? campaign.challenge.rewardKa ?? "",
          rewardEn: r?.titleEn ?? campaign.challenge.rewardEn ?? "",
          valueGel: r?.valueGel != null ? String(r.valueGel) : "",
          stock: r?.stock != null ? String(r.stock) : "",
          expiresAt: isoDay(r?.expiresAt ?? campaign.challenge.endsAt),
          xpReward: String(campaign.challenge.xpReward),
        }}
        labels={{
          rewardKa: t("rRewardKa"),
          rewardEn: t("rRewardEn"),
          value: t("rValue"),
          stock: t("rStock"),
          stockHint: t("rStockHint"),
          expires: t("rExpires"),
          xp: t("rXp"),
          xpHint: t("rXpHint"),
          total: t("rTotal"),
          totalBody: t.raw("rTotalBody") as string,
          totalUnknown: t("rTotalUnknown"),
          draft: t("saveDraft"),
          next: t("toRules"),
          invalid: t("invalid"),
        }}
      />
    </WizardLayout>
  );
}

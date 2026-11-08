// Admin 35 მისიის რედაქტირება — Figma 22:830. A post mission means "share a link to your public
// TikTok/Instagram post" (no video upload, by product decision), so it is labelled that way.
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminBody, AdminHeader, AdminTitle } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui";
import { getCampaign, missionsLocked } from "@/lib/admin-campaigns";
import { MissionForm } from "./mission-form";

export async function MissionPage({ campaignId, missionId }: { campaignId: string; missionId?: string }) {
  const campaign = await getCampaign(campaignId);
  if (!campaign) notFound();
  const mission = missionId ? campaign.missions.find((m) => m.id === missionId) : undefined;
  if (missionId && !mission) notFound();
  if (missionsLocked(campaign)) redirect(`/admin/campaigns/${campaign.challenge.id}/edit/missions`);
  const t = await getTranslations("admin.wizard");
  const c = await getTranslations("admin");
  const back = `/admin/campaigns/${campaign.challenge.id}/edit/missions`;
  return (
    <>
      <AdminHeader crumb={c("crumb")} back={back} action={<ButtonLink href="/admin/campaigns/new" variant="secondary" className="!w-[202px]">{t("newCampaign")}</ButtonLink>} />
      <AdminBody>
        <AdminTitle eyebrow={t("missionEyebrow")} title={t("missionTitle")} body={t("missionBody")} />
        <MissionForm
          campaignId={campaign.challenge.id}
          initial={
            mission
              ? {
                  missionId: mission.id,
                  titleKa: mission.titleKa,
                  titleEn: mission.titleEn,
                  type: mission.type === "social_post" ? "upload" : mission.type,
                  descriptionKa: mission.descriptionKa ?? "",
                  descriptionEn: mission.descriptionEn ?? "",
                  xpReward: String(mission.xpReward),
                  required: mission.required ? "on" : "",
                  placeName: mission.placeName ?? "",
                }
              : { type: campaign.challenge.kind === "visit" && !campaign.missions.some((m) => m.type === "visit_qr") ? "visit_qr" : "upload", xpReward: "100", required: "on" }
          }
          types={[
            { value: "visit_qr", label: t("typeQr") },
            { value: "upload", label: t("typePost") },
            { value: "invite", label: t("typeInvite") },
          ]}
          labels={{
            heading: t("missionDetails"),
            titleKa: t("mTitleKa"),
            titleEn: t("mTitleEn"),
            type: t("mType"),
            criteriaKa: t("mCriteriaKa"),
            criteriaEn: t("mCriteriaEn"),
            xp: t("mXp"),
            required: t("mRequired"),
            place: t("mPlace"),
            cancel: t("cancel"),
            save: t("saveMission"),
            remove: t("deleteMission"),
            invalid: t("invalid"),
          }}
        />
      </AdminBody>
    </>
  );
}

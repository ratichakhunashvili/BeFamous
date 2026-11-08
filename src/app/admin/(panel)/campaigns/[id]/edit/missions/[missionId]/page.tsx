// Admin 35 (edit mission).
import { requireAdminPage } from "@/lib/session";
import { MissionPage } from "../mission-page";

export default async function EditMissionPage({ params }: PageProps<"/admin/campaigns/[id]/edit/missions/[missionId]">) {
  await requireAdminPage();
  const { id, missionId } = await params;
  return <MissionPage campaignId={id} missionId={missionId} />;
}

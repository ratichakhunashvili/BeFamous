// Admin 35 (new mission).
import { requireAdminPage } from "@/lib/session";
import { MissionPage } from "../mission-page";

export default async function NewMissionPage({ params }: PageProps<"/admin/campaigns/[id]/edit/missions/new">) {
  await requireAdminPage();
  return <MissionPage campaignId={(await params).id} />;
}

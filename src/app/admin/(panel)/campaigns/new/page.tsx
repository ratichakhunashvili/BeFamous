// Admin 06 (create choice): only "manual" is left after removing AI, so go straight to step 12.
import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/session";

export default async function NewCampaignPage() {
  await requireAdminPage();
  redirect("/admin/campaigns/new/basics");
}

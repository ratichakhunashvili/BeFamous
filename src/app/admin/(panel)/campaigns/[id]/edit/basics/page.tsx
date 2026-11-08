// Admin 12 (editing an existing campaign).
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/admin-campaigns";
import { requireAdminPage } from "@/lib/session";
import { BasicsPage } from "../../../basics-page";

export default async function EditBasicsPage({ params }: PageProps<"/admin/campaigns/[id]/edit/basics">) {
  await requireAdminPage();
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  return <BasicsPage campaign={campaign} />;
}

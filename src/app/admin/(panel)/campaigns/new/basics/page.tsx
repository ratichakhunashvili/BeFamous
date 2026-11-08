// Admin 12 (new campaign) — the first save creates the draft.
import { requireAdminPage } from "@/lib/session";
import { BasicsPage } from "../../basics-page";

export default async function NewBasicsPage() {
  await requireAdminPage();
  return <BasicsPage campaign={null} />;
}

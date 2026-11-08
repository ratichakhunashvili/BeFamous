// Placeholder until its phase. Figma: 17 ჩემი აქტივობა
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="17 ჩემი აქტივობა" />;
}

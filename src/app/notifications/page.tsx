// Placeholder until its phase. Figma: 24 შეტყობინებები
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="24 შეტყობინებები" />;
}

// Placeholder until its phase. Figma: 26 პარამეტრები
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="26 პარამეტრები" />;
}

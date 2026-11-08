// Placeholder until its phase. Figma: 20 XP და დონე
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="20 XP და დონე" />;
}

// Placeholder until its phase. Figma: 22 ჯილდოები
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="22 ჯილდოები" />;
}

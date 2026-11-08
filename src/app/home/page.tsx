// Placeholder until its phase. Figma: 06 მთავარი
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="06 მთავარი" />;
}

// Placeholder until its phase. Figma: 54 მეგობრის მოწვევა
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="54 მეგობრის მოწვევა" />;
}

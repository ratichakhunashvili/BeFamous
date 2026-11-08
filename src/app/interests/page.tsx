// Placeholder until its phase. Figma: 05 ინტერესები
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="05 ინტერესები" />;
}

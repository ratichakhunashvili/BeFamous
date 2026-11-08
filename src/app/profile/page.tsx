// Placeholder until its phase. Figma: 25 პროფილი
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="25 პროფილი" />;
}

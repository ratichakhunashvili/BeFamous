// Placeholder until its phase. Figma: 12 QR შემოწმება
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="12 QR შემოწმება" />;
}

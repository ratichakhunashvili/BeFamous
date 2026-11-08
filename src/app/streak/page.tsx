// Placeholder until its phase. Figma: 21 სერია
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="21 სერია" />;
}

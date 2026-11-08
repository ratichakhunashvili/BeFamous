// Placeholder until its phase. Figma: 18 ბეჯების კოლექცია
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="18 ბეჯების კოლექცია" />;
}

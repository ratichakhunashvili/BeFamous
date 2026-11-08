// Placeholder until its phase. Figma: 13 ნამუშევრის ატვირთვა
import { PendingScreen } from "@/components/pending-screen";
import { requireUser } from "@/lib/session";

export default async function Page() {
  await requireUser();
  return <PendingScreen screen="13 ნამუშევრის ატვირთვა" />;
}

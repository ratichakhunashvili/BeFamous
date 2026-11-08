// Admin panel (Figma page 04 • Business — Dark) — built in Phase 6. Admins only, checked on the server.
import { PendingScreen } from "@/components/pending-screen";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  await requireAdmin();
  return <PendingScreen screen="Admin" />;
}
